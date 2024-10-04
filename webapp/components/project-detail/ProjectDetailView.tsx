import { Project } from '@/server/db/schema'
import React from 'react'
import ProjectDetailHeader from './ProjectDetailHeader';
import ProjectDetailStepper from './ProjectDetailStepper';
import ProjectDetailBody from './ProjectDetailBody';

interface ProjectDetailViewProps {
  project: Project;
}

export default function ProjectDetailView({ project }: ProjectDetailViewProps) {
  return (
    <div>
      {project.id}
      <ProjectDetailHeader />
      <ProjectDetailStepper />
      <ProjectDetailBody />
    </div>
  )
}
