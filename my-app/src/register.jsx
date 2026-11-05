import { useState } from 'react';
import { NavLink } from 'react-router-dom';
function Register() {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [badmessage,setbad] = useState(false)
  const [showPassword,setshowPassword] = useState(false)
  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.get('username'),
          email: formData.get('email'),
          password: formData.get('password'),
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Registration failed.');
        setbad(true)
      }

      setMessage(data.message || 'Account created successfully.');
      form.reset();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to register.');
      setbad(true)
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className='login-container'>
    <form className="forminput" onSubmit={handleSubmit}>
      <h1>Create account</h1>
      <label htmlFor="username">Username</label>
      <input id="username" name="username" type="text" minLength="3" maxLength="50" required />
      <label htmlFor="email">Email</label>
      <input id="email" name="email" type="email" required />
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
            onClick={() => setshowPassword(!showPassword)}
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
      <button type="submit" disabled={isSubmitting} onClick={()=>{
        setTimeout(() => setMessage(""), 5000);
      }}>
        {isSubmitting ? 'Creating account...' : 'Register'}
      </button>
    </form>
    {message && <p  className= { badmessage ? 'bad' : "good"} role="status">{message}</p>}
    <NavLink to='/login'>i havea count login</NavLink>
    </main>
  );
}

export default Register;