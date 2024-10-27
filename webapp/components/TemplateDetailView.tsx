"use client";

import { Template } from '@/server/db/schema';
import React, { useEffect, useState } from 'react'
import TemplateDetailHeader from './TemplateDetailHeader';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useRouter, useSearchParams } from 'next/navigation';
import ConfirmationModal from './ConfirmationModal';
import TemplateDetailBody from './upload-step/TemplateDetailBody';
import { CommonPrompt } from '@/interfaces/CommonPrompts';
import PromptEditorDialog from './PromptEditorDialog';

interface TemplateDetailViewProps {
  template: Template;
}

function TemplateDetailView({
  template,
}: TemplateDetailViewProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingPrompt, setIsSavingPrompt] = useState(false);
  const [prompts, setPrompts] = useState<CommonPrompt[]>([]);
  const [showTemplateDeleteConfirmation, setShowTemplateDeleteConfirmation]
    = useState(false);
  const [isDeletingTemplate, setIsDeletingTempate] = useState(false);
  const [isDeletingPrompt, setIsDeletingPrompt] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<CommonPrompt | null>(
    null
  );
  const [isCreatingPrompt, setIsCreatingPrompt] = useState(false);
  const [deletePromptId, setDeletePromptId] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const fetchPrompts = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(
          `/api/templates/${template.id}/prompts`
        );
        setPrompts(response.data);
      } catch (error) {
        console.error("Failed to fetch prompts:", error);
        toast.error("Failed to load prompts. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrompts();
  }, [template.id]);

  useEffect(() => {
    const promptId = searchParams.get("promptId");
    if (promptId) {
      const prompt = prompts.find((p) => p.id === promptId);
      if (prompt) setSelectedPrompt(prompt);
    } else {
      setSelectedPrompt(null);
    }
  }, [searchParams, prompts]);

  const handleDeleteTemplate = async () => {
    setIsDeletingTempate(true);
    try {
      await axios.delete(`/api/templates/${template.id}`);
      toast.success("Template deleted successfully.");
      router.push("/templates?deleted=true");
    } catch (error) {
      console.error("Error deleting template", error);
      toast.error("Error deleting template. Please tr");
    } finally {
      setIsDeletingTempate(false);
      setShowTemplateDeleteConfirmation(false);
    }
  };

  const handleCreatePrompt = async () => {
    setIsCreatingPrompt(true);
    try {
      const response = await axios.post(
        `/api/templates/${template.id}/prompts`,
        {
          name: "New Prompt",
          prompt: "",
          order: prompts.length,
          tokenCount: 0,
        },
      );
      const newPrompt = response.data;
      setPrompts((prev) => [...prev, newPrompt]);
      router.push(`?promptId=${newPrompt.id}`);
    } catch (error) {
      console.error("Error creating prompt", error);
      toast.error("Error creating prompt. Please try again later.");
    } finally {
      setIsCreatingPrompt(false);
    }
  };

  const handleDeletePrompt = async (id: string) => {
    setIsDeletingPrompt(true);
    try {
      await axios.delete(`/api/templates/${template.id}/prompts?id=${id}`);
      setPrompts(prompts.filter((p) => p.id !== id));
      toast.success("Prompt deleted successfully");
    } catch (error) {
      console.error("Failed to delete prompt:", error);
      toast.error("Failed to delete prompt. Please try again.");
    } finally {
      setDeletePromptId(null);
      setIsDeletingPrompt(false);
    }
  };

  const handleOnSave = async (updatedPrompt: CommonPrompt) => {
    setIsSavingPrompt(true);
    try {
      const response = await axios.patch<CommonPrompt>(
        `/api/templates/${template.id}/prompts`,
        updatedPrompt
      );
      const savedPrompt = response.data;

      setPrompts(
        prompts.map((p) => (p.id === updatedPrompt.id ? savedPrompt : p))
      );
      toast.success("Prompt saved successfully");
      handleCloseDialog();
    } catch (error) {
      console.error("Failed to save prompt:", error);
      toast.error("Failed to save prompt. Please try again.");
    } finally {
      setIsSavingPrompt(false);
    }
  };

  const handleCloseDialog = () => {
    setSelectedPrompt(null);
    router.push(`/template/${template.id}`, { scroll: false });
  };

  return (
    <div className="space-y-4 md:space-x-6">
      <TemplateDetailHeader
        template={template}
        setShowTemplateDeleteConfirmation={setShowTemplateDeleteConfirmation}
      />
      <ConfirmationModal
        isOpen={showTemplateDeleteConfirmation}
        onClose={() => setShowTemplateDeleteConfirmation(false)}
        onConfirm={handleDeleteTemplate}
        title="Delete Template"
        message="Are you sure you want to delete this template? This action cannot be undone."
        isLoading={isDeletingTemplate}
      />
      <TemplateDetailBody
        handleCreatePrompt={handleCreatePrompt}
        isCreatingPrompt={isCreatingPrompt}
        isLoading={isLoading}
        prompts={prompts}
        setDeletePromptId={setDeletePromptId}
      />
      <ConfirmationModal
        isOpen={!!deletePromptId}
        onClose={() => setDeletePromptId(null)}
        onConfirm={() => deletePromptId && handleDeletePrompt(deletePromptId)}
        title="Delete Prompt"
        message="Are you sure you want to delete this prompt? This action cannot be undone."
        isLoading={isDeletingPrompt}
      />
      <PromptEditorDialog
        isOpen={!!selectedPrompt}
        prompt={selectedPrompt}
        handleOnClose={handleCloseDialog}
        isSaving={isSavingPrompt}
        handleSave={handleOnSave}
      />
    </div>
  )
}

export default TemplateDetailView
