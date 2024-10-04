import React from 'react'

interface ProjectPageProps {
  params: {
    projectId: string
  }
}

export default function ProjectPage({ params }: ProjectPageProps) {

  return (
    <h1>{params.projectId}</h1>
  )
}
