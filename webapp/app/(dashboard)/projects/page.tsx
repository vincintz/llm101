import React from 'react'

type Project = {
  name: string
  description: string
}

export default async function ProjectsPage() {
  const projectPromise = new Promise<Project[]>((resolve) => {
    setTimeout(() => {
      resolve([
        { name: "Project 5", description: "Description 5" },
        { name: "Project 6", description: "Description 6" },
        { name: "Project 7", description: "Description 7" },
        { name: "Project 8", description: "Description 8" },
        { name: "Project 9", description: "Description 9" },
        { name: "Project 10", description: "Description 10" },
      ])
    }, 5000)
  })
  const projects = await projectPromise

  return (
    <div>
      <h1>Projects Page</h1>
      {projects.map((project, idx) => (
        <div key={idx}>{project.name}</div>
      ))}
    </div>
  )
}
