"use client";

import { Project } from '@/server/db/schema'
import React, { lazy, useEffect, useState } from 'react'
import ProjectDetailHeader from './project-detail/ProjectDetailHeader';
import ProjectDetailStepper from './project-detail/ProjectDetailStepper';
import ProjectDetailBody from './project-detail/ProjectDetailBody';
import ConfirmationModal from './ConfirmationModal';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useRouter, useSearchParams } from 'next/navigation';

const ManageUploadStep = lazy(() => import("./project-detail/ManageUploadStep"));
const ConfigurePromptsStep = lazy(() => import("./project-detail/ConfigurePromptsStep"));
const GenerateContentStep = lazy(() => import("./project-detail/GenerateContentStep"));

const steps = [
  { name: "Upload Media", tab: "upload", component: ManageUploadStep },
  { name: "Prompts", tab: "prompts", component: ConfigurePromptsStep },
  { name: "Generate", tab: "generate", component: GenerateContentStep },
];

interface ProjectDetailViewProps {
  project: Project;
};

export default function ProjectDetailView({ project }: ProjectDetailViewProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirmationModal, setShowDeleteConfirmationModal] = useState(false);
  const searchParams = useSearchParams();
  const findStepIndex = (tab: string) => {
    const index = steps.findIndex((step) => step.tab === tab);
    return index < 0 ? 0 : index;
  };
  const [currentStep, setCurrentStep] = useState(findStepIndex(searchParams.get("tab") ?? "upload"));

  const router = useRouter();

  const handleStepClick = (index: number) => {
    router.push(`/project/${project.id}?tab=${steps[index].tab}`, {
      scroll: false,
    });
  };

  useEffect(() => {
    const tab = searchParams.get("tab") ?? "upload";
    setCurrentStep(findStepIndex(tab));
  }, [searchParams]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await axios.delete(`/api/projects/${project.id}`);
      toast.success("Prject deleted successfully.");
      router.push("/projects?deleted=true");
    } catch (error) {
      toast.error("Failed to delete project. Please try again.");
      console.error(error);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirmationModal(false);
    }
  };

  return (
    <div className="max-w-screen-xl mx-auto p-4 sm:p-6 lg:p-8 bg-white space-y-12">
      <ProjectDetailHeader
        project={project}
        setShowDeleteConfirmationModal={setShowDeleteConfirmationModal}
      />
      <ProjectDetailStepper
        currentStep={currentStep}
        handleStepClick={handleStepClick}
        steps={steps}
      />
      <ProjectDetailBody
        currentStep={currentStep}
        projectId={project.id}
        steps={steps}
      />

      <ConfirmationModal
        isOpen={showDeleteConfirmationModal}
        title="Delete Project"
        message="Are you sure you want to delete this project?"
        isLoading={isDeleting}
        onClose={() => setShowDeleteConfirmationModal(false)}
        onConfirm={handleDelete}
      />
    </div>
  )
}
