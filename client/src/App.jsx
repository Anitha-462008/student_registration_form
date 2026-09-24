import { useEffect, useState } from 'react'
import './App.css'

const companies = [
  { name: 'Google', mark: 'G', tone: 'blue' }, { name: 'Microsoft', mark: 'M', tone: 'orange' },
  { name: 'Amazon', mark: 'a', tone: 'gold' }, { name: 'Apple', mark: '●', tone: 'ink' },
  { name: 'Adobe', mark: 'A', tone: 'red' }, { name: 'IBM', mark: 'ibm', tone: 'navy' },
  { name: 'Deloitte', mark: 'D', tone: 'green' }, { name: 'Infosys', mark: 'i', tone: 'purple' },
  { name: 'Accenture', mark: 'A', tone: 'violet' }, { name: 'TCS', mark: 'T', tone: 'cyan' },
]
const blankForm = { studentName: '', rollNumber: '', dob: '', bloodGroup: '', phone: '', email: '', address: '', department: '', gender: '', year: '', section: '', arrears: '0' }

function App() {
  const [view, setView] = useState('register')
  const [step, setStep] = useState(1)
  const [form, setForm] = useState(blankForm)
  const [selectedCompanies, setSelectedCompanies] = useState([])
  const [registrations, setRegistrations] = useState([])
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  useEffect(() => {
    fetch('/api/registrations')
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('Failed to load registrations.')))
      .then(setRegistrations)
      .catch(() => setError('The server is unavailable. Start the backend and try again.'))
  }, [])
  const updateField = (event) => setForm({ ...form, [event.target.name]: event.target.value })
  const canContinue = Object.values(form).every(Boolean) && Number(form.arrears) === 0
  const toggleCompany = (name) => setSelectedCompanies((current) => current.includes(name) ? current.filter((company) => company !== name) : current.length < 4 ? [...current, name] : current)
  const submitRegistration = async (event) => {
    event.preventDefault()
    if (selectedCompanies.length !== 4) return
    setError('')
    try {
      const response = await fetch('/api/registrations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, companies: selectedCompanies }) })
      const savedRegistration = await response.json()
      if (!response.ok) throw new Error(savedRegistration.message || 'Failed to save registration.')
      setRegistrations((current) => [savedRegistration, ...current])
      setSubmitted(true)
    } catch (submissionError) {
      setError(submissionError.message)
    }
  }
  const resetRegistration = () => { setForm(blankForm); setSelectedCompanies([]); setStep(1); setSubmitted(false); setView('register') }
  const groupedRegistrations = companies.map((company) => ({ ...company, students: registrations.filter((student) => student.companies.includes(company.name)) }))
  return <main className="app-shell">
    <header className="topbar"><button className="brand" onClick={() => setView('register')} aria-label="Campus Connect home"><span className="brand-mark">cc</span><span>campus<span className="brand-accent">connect</span></span></button><nav className="main-nav" aria-label="Main navigation"><button className={view === 'register' ? 'active' : ''} onClick={() => setView('register')}><span>＋</span> Student registration</button><button className={view === 'admin' ? 'active' : ''} onClick={() => setView('admin')}><span>▦</span> Admin view</button></nav><div className="status"><span className="status-dot" /> Registration open</div></header>
    {error && <p className="api-error" role="alert">{error}</p>}
    {view === 'admin' ? <section className="admin-page"><div className="page-heading"><div><p className="eyebrow">PLACEMENT DESK / ADMIN</p><h1>Company-wise registrations</h1><p>Review eligible students by their preferred company.</p></div><div className="total-stat"><strong>{registrations.length}</strong><span>total students</span></div></div><div className="company-grid">{groupedRegistrations.map((company) => <article className="company-panel" key={company.name}><div className="company-heading"><span className={`company-logo ${company.tone}`}>{company.mark}</span><div><h2>{company.name}</h2><span>{company.students.length} {company.students.length === 1 ? 'student' : 'students'}</span></div></div>{company.students.length ? <div className="student-list">{company.students.map((student) => <div className="student-row" key={`${student.id}-${company.name}`}><span className="avatar">{student.studentName.charAt(0).toUpperCase()}</span><div><strong>{student.studentName}</strong><span>{student.rollNumber} · {student.department}</span></div><span className="student-year">Year {student.year}</span></div>)}</div> : <p className="empty-company">No registrations yet</p>}</article>)}</div></section> : <section className="registration-page"><div className="page-heading"><div><p className="eyebrow">CAMPUS PLACEMENTS / 2026</p><h1>Start your next chapter.</h1><p>Register once. Get considered by the companies you want to build with.</p></div><div className="stepper"><span className={step === 1 ? 'current' : 'complete'}>01 <b>Profile</b></span><i /><span className={step === 2 ? 'current' : ''}>02 <b>Company choices</b></span></div></div>
      {submitted ? <div className="success-card"><span className="success-icon">✓</span><p className="eyebrow">REGISTRATION COMPLETE</p><h2>You’re on the list, {form.studentName.split(' ')[0]}.</h2><p>Your profile has been saved with your four company preferences.</p><div className="chosen-chips">{selectedCompanies.map((company) => <span key={company}>{company}</span>)}</div><button className="primary-button" onClick={resetRegistration}>Register another student <span>→</span></button></div> : step === 1 ? <form className="form-card" onSubmit={(event) => { event.preventDefault(); if (canContinue) setStep(2) }}><div className="card-title"><div><span className="section-number">01</span><h2>Your profile</h2></div><span className="required-note">All fields required</span></div><div className="form-grid"><Field label="Student name" name="studentName" value={form.studentName} onChange={updateField} placeholder="e.g. Ananya Sharma" /><Field label="Roll number" name="rollNumber" value={form.rollNumber} onChange={updateField} placeholder="e.g. 21CSE042" /><Field label="Date of birth" name="dob" type="date" value={form.dob} onChange={updateField} /><SelectField label="Blood group" name="bloodGroup" value={form.bloodGroup} onChange={updateField} options={['A+', 'A−', 'B+', 'B−', 'AB+', 'AB−', 'O+', 'O−']} /><Field label="Phone number" name="phone" type="tel" value={form.phone} onChange={updateField} placeholder="+91 98765 43210" /><Field label="Email ID" name="email" type="email" value={form.email} onChange={updateField} placeholder="you@college.edu" /><div className="field full"><label htmlFor="address">Address</label><textarea id="address" name="address" value={form.address} onChange={updateField} placeholder="Current residential address" rows="3" required /></div><SelectField label="Department of engineering" name="department" value={form.department} onChange={updateField} options={['Computer Science & Engineering', 'Information Technology', 'Electronics & Communication', 'Electrical & Electronics', 'Mechanical Engineering', 'Civil Engineering']} /><SelectField label="Gender" name="gender" value={form.gender} onChange={updateField} options={['Female', 'Male', 'Non-binary', 'Prefer not to say']} /><SelectField label="Year" name="year" value={form.year} onChange={updateField} options={['1', '2', '3', '4']} /><SelectField label="Section" name="section" value={form.section} onChange={updateField} options={['A', 'B', 'C', 'D']} /><Field label="Number of arrears" name="arrears" type="number" min="0" value={form.arrears} onChange={updateField} placeholder="0" /></div><div className="form-footer"><p><span className="lock">⌑</span> Your information is only shared with participating companies.</p><button className="primary-button" type="submit" disabled={!canContinue}>Continue to company choices <span>→</span></button></div>{Number(form.arrears) > 0 && <p className="form-error">You need 0 arrears to continue to company choices.</p>}</form> : <form className="form-card choices-card" onSubmit={submitRegistration}><div className="card-title"><div><span className="section-number">02</span><h2>Choose your companies</h2></div><span className="choice-count">{selectedCompanies.length} / 4 selected</span></div><p className="choice-intro">Pick the four MNCs you’d be excited to hear from. You can change your choices before submitting.</p><div className="companies-grid">{companies.map((company) => <button type="button" className={`company-choice ${selectedCompanies.includes(company.name) ? 'selected' : ''}`} key={company.name} onClick={() => toggleCompany(company.name)}><span className={`company-logo ${company.tone}`}>{company.mark}</span><strong>{company.name}</strong><span className="check">{selectedCompanies.includes(company.name) ? '✓' : '＋'}</span></button>)}</div><div className="form-footer"><button type="button" className="back-button" onClick={() => setStep(1)}>← Back to profile</button><button className="primary-button" type="submit" disabled={selectedCompanies.length !== 4}>Submit registration <span>→</span></button></div></form>}
    </section>}<footer><span>campusconnect</span><span>© 2026 · Built for ambitious students</span></footer>
  </main>
}
function Field({ label, name, type = 'text', value, onChange, placeholder, ...props }) { return <div className="field"><label htmlFor={name}>{label}</label><input id={name} name={name} type={type} value={value} onChange={onChange} placeholder={placeholder} required {...props} /></div> }
function SelectField({ label, name, value, onChange, options }) { return <div className="field"><label htmlFor={name}>{label}</label><select id={name} name={name} value={value} onChange={onChange} required><option value="">Select</option>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select></div> }
export default App
