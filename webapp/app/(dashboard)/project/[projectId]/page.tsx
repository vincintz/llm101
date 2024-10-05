import ProjectDetailView from '@/components/ProjectDetailView'
import { getProject } from '@/server/queries'
import { notFound } from 'next/navigation'
import React from 'react'

interface ProjectPageProps {
  params: {
    projectId: string
  }
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const project = await getProject(params.projectId);

  if (!project) {
    return notFound();
  }

  return (
    <div>
      <ProjectDetailView project={project} />
    </div>
  )
}
