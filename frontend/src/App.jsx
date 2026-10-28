import { useEffect, useState } from 'react'
import './App.css'

function App() {
const [activeWorkspace, setActiveWorkspace] = useState('Study')
const [goal, setGoal] = useState('')
const [materials, setMaterials] = useState(() => {
  try {
    return JSON.parse(localStorage.getItem('shiftdesk-materials')) || []
  } catch {
    return []
  }
})

const [selectedCategory, setSelectedCategory] = useState('All')

useEffect(() => {
  localStorage.setItem(
    'shiftdesk-materials',
    JSON.stringify(materials)
  )
}, [materials])
function handleFileUpload(event) {
const files = Array.from(event.target.files || [])

const newMaterials = files.map(file => ({
  id: `${Date.now()}-${file.name}-${Math.random()}`,
  name: file.name,
  type: file.type || 'Unknown file type',
  size: file.size,
  workspace: activeWorkspace,
  category: selectedCategory === 'All'
    ? 'Other'
    : selectedCategory,
  url: URL.createObjectURL(file)
}))

setMaterials(previous => [...previous, ...newMaterials])

event.target.value = ''

}

function removeMaterial(id) {
setMaterials(previous =>
previous.filter(file => file.id !== id)
)
}


return ( <div className="app"> <aside className="sidebar"> <h2 className="logo">✦ ShiftDesk</h2> <p className="sidebar-label">YOUR WORKSPACE</p>

    <button
      className={activeWorkspace === 'Study' ? 'nav-item active' : 'nav-item'}
      onClick={() => setActiveWorkspace('Study')}
    >
      📚 Study
    </button>

    <button
      className={activeWorkspace === 'Project' ? 'nav-item active' : 'nav-item'}
      onClick={() => setActiveWorkspace('Project')}
    >
      💻 Projects
    </button>

    <div className="sidebar-bottom">
      <span>🌱</span>
      <p>Small steps count.</p>
    </div>
  </aside>

  <main className="main-content">
    <header className="topbar">
      <span>YOUR PERSONAL WORKSPACE</span>
      <span className="status">● Workspace ready</span>
    </header>

    <section className="welcome">
      <p className="eyebrow">A LITTLE PROGRESS EVERY DAY</p>
      <h1>Make room for what<br />matters.</h1>
      <p className="subtitle">
        One workspace for your studies, projects, and ideas.
      </p>
    </section>

    <section className="goal-card">
      <label htmlFor="goal">WHAT WOULD YOU LIKE TO WORK ON?</label>
      <div className="goal-input-row">
        <input
          id="goal"
          type="text"
          placeholder="e.g. Prepare for my Java exam in 3 days..."
          value={goal}
          onChange={(event) => setGoal(event.target.value)}
        />
        <button
          className="goal-button"
          onClick={() => {
  const text = goal.trim().toLowerCase()

  if (!text) {
    alert('Please enter a goal first!')
    return
  }

  const projectKeywords = [
    'project',
    'milestone',
    'development',
    'coding',
    'build an app',
    'build a website',
    'prototype'
  ]

  const isProject = projectKeywords.some(keyword =>
    text.includes(keyword)
  )

  setActiveWorkspace(isProject ? 'Project' : 'Study')
}}
        >
          Organise my work ↗
        </button>
      </div>
      <p className="hint">
        ✨ Tell us your goal to get started. Smart goal interpretation comes later.
      </p>
    </section>

    <section className="workspace-heading">
      <div>
        <p className="eyebrow">YOUR SPACE</p>
        <h2>{activeWorkspace} Workspace</h2>
      </div>
      <span className="workspace-tag">
        {activeWorkspace === 'Study' ? '📖 Learning mode' : '🚀 Building mode'}
      </span>
    </section>

    {activeWorkspace === 'Study' ? (
      <section className="cards">
        <article className="feature-card">
          <span className="card-icon">☑️</span>
          <h3>Study Checklist</h3>
          <p>Break your learning goals into manageable tasks.</p>
          <span className="card-footer">PLAN YOUR SESSION →</span>
        </article>

        <article className="feature-card">
          <span className="card-icon">📝</span>
          <h3>Subject Notes</h3>
          <p>Keep important concepts and revision notes together.</p>
          <span className="card-footer">KEEP YOUR NOTES →</span>
        </article>

        <article className="feature-card">
          <span className="card-icon">⏱️</span>
          <h3>Focus Time</h3>
          <p>Make space for a focused, distraction-free session.</p>
          <span className="card-footer">FOCUS ON ONE THING →</span>
        </article>
      </section>
    ) : (
      <section className="cards">
        <article className="feature-card">
          <span className="card-icon">📋</span>
          <h3>Project Tasks</h3>
          <p>Organise development work into clear next steps.</p>
          <span className="card-footer">PLAN YOUR WORK →</span>
        </article>

        <article className="feature-card">
          <span className="card-icon">🎯</span>
          <h3>Milestones</h3>
          <p>Keep track of important project goals.</p>
          <span className="card-footer">TRACK PROGRESS →</span>
        </article>

        <article className="feature-card">
          <span className="card-icon">💡</span>
          <h3>Project Notes</h3>
          <p>Collect ideas and decisions in one place.</p>
          <span className="card-footer">SAVE YOUR IDEAS →</span>
        </article>
      </section>
    )}

    <section className="materials-section">
  <div className="materials-heading">
    <div>
      <p className="eyebrow">YOUR RESOURCES</p>
      <h2>
        {activeWorkspace === 'Study'
          ? 'Study Materials'
          : 'Project Files'}
      </h2>
      <p className="materials-description">
        Keep your important files in one place.
      </p>
    </div>

    <label className="upload-button">
      + Upload files
      <input
        type="file"
        multiple
        onChange={handleFileUpload}
        hidden
      />
    </label>
  </div>

  <div className="materials-list">
    {materials.filter(file =>
      file.workspace === activeWorkspace
    ).length === 0 ? (
      <div className="empty-materials">
        <span>📂</span>
        <h3>No materials yet</h3>
        <p>Upload your first file to get started.</p>
      </div>
    ) : (
      materials
        .filter(file => file.workspace === activeWorkspace)
        .map(file => (
          <article className="material-item" key={file.id}>
            <span className="file-icon">📄</span>

            <div className="material-info">
              <strong>{file.name}</strong>
              <span>
                {(file.size / 1024).toFixed(1)} KB
              </span>
            </div>

            <a
              href={file.url}
              target="_blank"
              rel="noreferrer"
              className="open-file"
            >
              Open ↗
            </a>

            <button
              className="remove-file"
              onClick={() => removeMaterial(file.id)}
            >
              ✕
            </button>
          </article>
        ))
    )}
  </div>
</section>
        <footer>SHIFTDESK · YOUR GOALS, ONE SPACE AT A TIME 🌿</footer>
  </main>
</div>

)
}
export default App
