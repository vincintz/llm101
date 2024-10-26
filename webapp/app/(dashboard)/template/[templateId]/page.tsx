import TemplateDetailView from '@/components/TemplateDetailView';
import { getTemplate } from '@/server/queries';
import { notFound } from 'next/navigation';
import React from 'react'

interface TemplatePageProps {
  params: {
    templateId: string
  }
}

export default async function TemplatePage({
  params,
}: TemplatePageProps) {
  const template = await getTemplate(params.templateId);

  if (!template) {
    return notFound();
  }

  return (
    <div className="p-2 sm:p-4 md:p-6 lg:p-8 mt-2">
      <TemplateDetailView template={template} />
    </div>
  )
}
