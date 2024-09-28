import React from 'react'

type Template = {
  name: string
  description: string
}

export default async function TemplatesPage() {
  const templatePromise = new Promise<Template[]>((resolve) => {
    setTimeout(() => {
      resolve([
        { name: "Template 5", description: "Description 5" },
        { name: "Template 6", description: "Description 6" },
        { name: "Template 7", description: "Description 7" },
        { name: "Template 8", description: "Description 8" },
        { name: "Template 9", description: "Description 9" },
        { name: "Template 10", description: "Description 10" },
      ])
    }, 5000)
  })
  const templates = await templatePromise

  return (
    <div>
      <h1>Templates Page</h1>
      {templates.map((template, idx) => (
        <div key={idx}>{template.name}</div>
      ))}
    </div>
  )
}
