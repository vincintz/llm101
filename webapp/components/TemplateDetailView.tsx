import { Template } from '@/server/db/schema';
import React from 'react'

interface TemplateDetailViewProps {
  template: Template;
}

function TemplateDetailView({
  template,
}: TemplateDetailViewProps) {
  return (
    <div>
      TemplateDetailView: {template.title}
    </div>
  )
}

export default TemplateDetailView
