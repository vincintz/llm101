import { Project } from '@/server/db/schema'
import React from 'react'
import { Card, CardHeader, CardTitle } from './ui/card';
import { getTimeDifference } from '@/utils/timeUtils';
import Link from 'next/link';

interface ProjectListProps {
  projects: Project[];
}

export default function ProjectList({projects}: ProjectListProps) {
  return (
    <div className="grid gap-4 sm:gap-6 md:gap-8 lg:gap-10 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <Link key={project.id} href={`/project/${project.id}`}>
          <Card
            className="border border-gray-200 rounded-3xl p-3 hover:border-main hover:scale-[1.01] hover:shadow-md hover:text-main transition-all duration-300"
          >
            <CardHeader className="pb-3 sm:pb-4 lg:pb-5 w-full">
              <CardTitle className="text-lg sm:text-xl lg:text-2xl truncate">
                {project.title}
              </CardTitle>
              <p className="text-xs sm:text-sm text-gray-500 truncate">
                Updated {getTimeDifference(project.updatedAt)}
              </p>
            </CardHeader>
          </Card>
        </Link>
      ))}
    </div>
  )
}
