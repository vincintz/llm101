import { Project } from '@/server/db/schema'
import React from 'react'
import ProjectDetailHeader from './project-detail/ProjectDetailHeader';
import ProjectDetailStepper from './project-detail/ProjectDetailStepper';
import ProjectDetailBody from './project-detail/ProjectDetailBody';

interface ProjectDetailViewProps {
  project: Project;
}

export default function ProjectDetailView({ project }: ProjectDetailViewProps) {
  return (
    <div>
      <ProjectDetailHeader />
      <ProjectDetailStepper />
      <ProjectDetailBody />
      <h2>{project.title}</h2>
    </div>
  )
}
