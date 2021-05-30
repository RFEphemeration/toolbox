

class BaseCharacterController : MonoBehaviour
{

	// friction units are almost the inverse of number of seconds to stop
	// except that it's not linear, so it will take slightly longer
	protected float airFrictionRelative = 1f;
	protected float groundFrictionRelative = 2f;

	protected float airFrictionConstant = 10f;
	protected float groundFrictionConstant = 15f;

	// this is to prevent tiny sliding at the tail end
	protected float minGroundFrictionReduction = 10f;

	protected float gravity;


	public bool IsGrounded { get; protected set; }

	protected float timeToApex;
	private bool hitMaxJump;


	protected Dictionary<string, Force> movements = new Dictionary<string, Force>();
	protected Force velocity = new Force();
	

	public void StartJump()
	{
		animator.Play("Jump_Start");
		IsGrounded = false;
		ChangeToJumpCollider();

		float initVelocityY;
		if (airFrictionRelative == 0f)
		{
			float acceleration = gravity / Time.fixedDeltaTime + airFrictionConstant;
			initVelocityY = Mathf.Sqrt(2f * ( maxJumpHeight / Time.fixedDeltaTime) * acceleration);
			timeToApex = initVelocityY / acceleration;
		}
		else
		{
			initVelocityY = CalculateJumpVelocityToReachHeight(maxJumpHeight / Time.fixedDeltaTime);
			// rmf note: this time to apex is inaccurate but also unused
			timeToApex = initVelocityY / gravity;
		}
		
		velocity.y = initVelocityY ;
		//Debug.Log(gravity);
		//Debug.Log("StartJump: " + Time.time);
	}

	public void UpdateJump()
	{
		if(!hitMaxJump && !playerActions.Jump.IsPressed)
		{
			// rmf forces: check that setting momentum here is appropriate
			float calculateMinJump = Mathf.Sqrt(2 * (minJumpHeight) * gravity) / Time.fixedDeltaTime;
			float minJump = Mathf.Clamp(calculateMinJump, Mathf.NegativeInfinity, velocity.y);

			velocity.y = minJump;
			hitMaxJump = true;
		}
	}

	public void EndJump()
	{
		hitMaxJump = false;
		//Debug.Log("EndJump: " + Time.time);
	}

	// target height, gravity, air_friction -> initial velocity
	static Dictionary<Tuple<float, float, float>, float> jumpVelocityCache = new Dictionary<Tuple<float, float, float>, float>();
	protected float CalculateJumpVelocityToReachHeight(float height)
	{
		// using newton's method with a linear approximation of derivative
		const float tollerance = 0.1f;
		const float firstPrevGuessRatio = 1.4f;
		const float firstPrevGuessDelta = 0.1f;
		const float jumpTimeWithoutGravity = 0.25f;
		var cacheKey = new Tuple<float, float, float>(height, gravity, airFrictionRelative);
		if (jumpVelocityCache.ContainsKey(cacheKey))
		{
			return jumpVelocityCache[cacheKey];
		}
		if (gravity == 0f)
		{
			return height / jumpTimeWithoutGravity;
		}
		
		float guess = Mathf.Sqrt(2 * height * gravity);
		//Debug.Log("Initial Guess: " + guess);
		float prev = guess * firstPrevGuessRatio + firstPrevGuessDelta; 
		float prevHeight = EstimatedHeightForVelocity(prev);

		float error;
		while (true)
		{
			if (float.IsNaN(guess) || float.IsInfinity(guess))
			{
				// error, produce some reasonable fallback
				return height / jumpTimeWithoutGravity;
			}
			float guessHeight = EstimatedHeightForVelocity(guess);
			error = guessHeight - height;
			if (Math.Abs(error) < tollerance)
			{
				break;
			}
			float slope = (guessHeight - prevHeight) / (guess - prev);
			float next = guess - error / slope;
			prev = guess;
			guess = next;
			prevHeight = guessHeight;
		}

		jumpVelocityCache[cacheKey] = guess;

		//Debug.Log("Ending Guess: " + guess);
		return guess;
	}

	protected float EstimatedHeightForVelocity(float yVelocity)
	{
		Force f = new Force(0f, yVelocity);
		float sum = 0f;
		while (f.y > 0f && !float.IsNaN(f.y) && !float.IsInfinity(f.y))
		{
			sum += f.y * Time.fixedDeltaTime;
			StepAirVelocity(ref f);
		}
		return sum;
	}

	private void StepAirVelocity(ref Force velocity)
	{
		float xReduction = Mathf.Abs(velocity.x) * airFrictionRelative * Time.fixedDeltaTime
			+ (airFrictionConstant * Time.fixedDeltaTime);
		float yReduction = Mathf.Abs(velocity.y) * airFrictionRelative * Time.fixedDeltaTime
			+ (airFrictionConstant * Time.fixedDeltaTime);
		velocity.RemoveFromX(xReduction);
		velocity.RemoveFromY(yReduction);

		// only apply gravity if we're below terminal velocity
		// this allows us to have more than terminal velocity if pushed
		if (velocity.y > TERMINAL_VELOCITY / Time.fixedDeltaTime)
		{
			velocity.y -= gravity;
			velocity.y = Mathf.Clamp(velocity.y, TERMINAL_VELOCITY / Time.fixedDeltaTime, float.MaxValue);
		}
	}

	private void StepGroundVelocity(ref Force velocity)
	{
		//no yFriction when grounded, assuming there are no ramps
		float xReduction = Mathf.Abs(velocity.x) * groundFrictionRelative * Time.fixedDeltaTime
			+ (groundFrictionConstant * Time.deltaTime);
		/*
		float yReduction = Mathf.Abs(velocity.y) * groundFrictionRelative * Time.fixedDeltaTime
			+ (groundFrictionConstant * Time.deltaTime);
		*/
		xReduction = Mathf.Max(xReduction, minGroundFrictionReduction * Time.fixedDeltaTime);
		//yReduction = Mathf.Max(yReduction, minGroundFrictionReduction * Time.fixedDeltaTime);
		velocity.RemoveFromX(xReduction);
		//velocity.RemoveFromY(yReduction);
	}

}


// rmf note: this class is to enable references in a dictionary
// since Vector2 is a struct, you can't do things like forces["move"].x = 0f;
public class Force
{
	public float x;
	public float y;

	AnimationCurve curve;
	float time = 0f;
	Vector2 magnitude;

	public Force()
	{
		x = 0f;
		y = 0f;
	}

	public Force(float x = 0f, float y = 0f)
	{
		this.x = x;
		this.y = y;
	}

	public Force(AnimationCurve curve, float x, float y)
	{
		Set(curve, x, y);
	}

	public void Set(AnimationCurve curve, float x, float y)
	{
		time = 0f;
		this.curve = curve;
		magnitude = new Vector2(x, y);
		Step(0f);
	}

	public void Set(AnimationCurve curve, float x, float y, float skip_to_time)
	{
		time = skip_to_time;
		this.curve = curve;
		magnitude = new Vector2(x, y);
		Step(0f);
	}

	public void Step(float delta)
	{
		if (curve != null)
		{
			time += delta;
			float portion = curve.Evaluate(time);
			x = portion * magnitude.x;
			y = portion * magnitude.y;
		}
	}

	public void RemoveFromX(float magnitude)
	{
		if (curve != null)
		{
			// having a curve overwrites getting distributed acceleration from other sources
			// and is therefore incompatible
			// this should be fixed
			return;
		}
		float newX = x - (Mathf.Abs(magnitude) * Mathf.Sign(x));
		if (Mathf.Sign(newX) != Mathf.Sign(x))
		{
			x = 0f;
		}
		else if (Mathf.Abs(newX) < Mathf.Abs(x))
		{
			x = newX;
		}
	}

	public void RemoveFromY(float magnitude)
	{
		if (curve != null)
		{
			// having a curve overwrites getting distributed acceleration from other sources
			// and is therefore incompatible
			// rmf todo: fix this
			return;
		}
		float newY = y - (Mathf.Abs(magnitude) * Mathf.Sign(x));
		if (Mathf.Sign(newY) != Mathf.Sign(y))
		{
			y = 0f;
		}
		else if (Mathf.Abs(newY) < Mathf.Abs(y))
		{
			y = newY;
		}
	}

	public static Force operator +(Force a, Force b)
	{
		return new Force(a.x + b.x, a.y + b.y);
	}

	public static implicit operator Vector2(Force f)
	{
		return new Vector2(f.x, f.y);
	}

	public static implicit operator Force(Vector2 v)
	{
		return new Force(v.x, v.y);
	}
}
