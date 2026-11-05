import {useState} from 'react'
import {NavLink,useNavigate} from 'react-router-dom'
function Login(){
    const [message, setmessage] = useState('');
    const [isSubmiting, setSubmit] = useState(false);
    const [status, setstatus] =useState(false)
    const navigate = useNavigate()
    const [user, setUser] = useState(null);
    const [showPassword, setShowPassword] = useState(false)
 async function handleSubmiting(event) {
    event.preventDefault();
    setmessage('');
    setSubmit(true);
    const form = event.currentTarget;
    const formdata = new FormData(form);
    try {
        const response = await fetch('http://127.0.0.1:8000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: formdata.get('email'),
                password: formdata.get('password')
            })
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.detail || "Login Failed!");
        }
        // Save JWT
        localStorage.setItem("access_token", data.access_token);
        // Fetch profile using JWT
        const profileResponse = await fetch('http://127.0.0.1:8000/api/me', {
            headers: {
                Authorization: `Bearer ${data.access_token}`
            }
        });
        const profileData = await profileResponse.json();
        if (!profileResponse.ok) {
            throw new Error(profileData.detail || "Could not load profile");
        }
        setUser(profileData);
        setmessage("Login successful!");
        form.reset();
        setstatus(true);
    } catch (error) {
        setmessage(
            error instanceof Error ? error.message : 'Unable to log in.'
        );
    } finally {
        setSubmit(false);
    }
}
    if (status===true) {
        navigate('/')
    }
    return (
        <main className='login-container'>
        <form className="forminput" onSubmit={handleSubmiting}>
            <h1>Login</h1>
            <label htmlFor='email' > Email</label>
            <input
            type='email'
            placeholder='you@gmail.com'
            id = 'email'
            name='email'
            required
            />
            <label htmlFor="password">Password</label>
            <div className='password_toggle'>
            <input
               type={showPassword ? 'text' : 'password'}
               name='password'
               id = 'password'
               required
            />
            <button
            type='button'
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            aria-pressed={showPassword}
            onClick={() => setShowPassword(!showPassword)}
            >
                <svg viewBox='0 0 24 24' aria-hidden='true' focusable='false'>
                    {showPassword ? (
                        <>
                            <path d='M3 3l18 18' />
                            <path d='M10.6 10.6a2 2 0 0 0 2.8 2.8' />
                            <path d='M9.9 5.2A10.7 10.7 0 0 1 12 5c6.4 0 10 7 10 7a15.7 15.7 0 0 1-3.1 3.8' />
                            <path d='M6.2 6.2C3.5 8 2 12 2 12s3.6 7 10 7a10.5 10.5 0 0 0 4-.8' />
                        </>
                    ) : (
                        <>
                            <path d='M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z' />
                            <circle cx='12' cy='12' r='3' />
                        </>
                    )}
                </svg>
            </button>
              </div>
            <button type='submit' onClick={()=> {setTimeout(() =>  setmessage(""), 1700)}}>{isSubmiting  ? "Logging in" : "login"} </button>
             {message && <p role='status' >{message + " try again"}</p>}
        </form>
             <NavLink to='/register'>I dont have an acount Signin</NavLink>
        </main>
    )
}
export default Login;