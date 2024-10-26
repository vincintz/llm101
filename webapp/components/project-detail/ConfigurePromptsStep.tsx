import React, { useEffect, useState } from 'react'
import ConfigurePromptsStepHeader from './ConfigurePromptsStepHeader'
import { useRouter, useSearchParams } from 'next/navigation';
import { Prompt } from '@/server/db/schema';
import axios from 'axios';
import toast from 'react-hot-toast';
import PromptList from './PromptList';
import ConfirmationModal from '../ConfirmationModal';


interface ConfigurePromptsStepProps {
  projectId: string;
}

export default function ConfigurePromptsStep({
  projectId,
}: ConfigurePromptsStepProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [isCreatingPrompt, setIsCreatingPrompt] = useState(false);
  const [isImportingTemplate, setIsImportingTemplate] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [deletePromptId, setDeletePromptId] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const promptId = searchParams.get("promptId");
    if (promptId) {
      setSelectedPrompt(prompts.find((p) => p.id === promptId) || null);
    } else {
      setSelectedPrompt(null);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchPrompts = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get<Prompt[]>(
          `/api/projects/${projectId}/prompts`
        );
        setPrompts(response.data);
      } catch (error) {
        console.error(error);
        toast.error("Failed to fetch prompts");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrompts();
  }, [projectId]);

  const handlePromptCreate = async () => {
    setIsCreatingPrompt(true);
    try {
      const response = await axios.post<Prompt>(
        `/api/projects/${projectId}/prompts`,
        {
          name: "New Prompt",
          prompt: "",
          order: prompts.length,
          tokenCount: 0,
        }
      );

      const newPrompt = response.data;
      setPrompts((prev) => [...prev, newPrompt]);

      router.push(`?tab=prompts&promptId=${newPrompt.id}`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to create prompt");
    } finally {
      setIsCreatingPrompt(false);
    }
  };

  const handlePromptDelete = async (promptId: string) => {
    setIsDeleting(true);
    try {
      await axios.delete(
        `/api/projects/${projectId}/prompts?promptId=${promptId}`
      );
      setPrompts((prev) => prev.filter((p) => p.id !== promptId));
      toast.success("Prompt deleted successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete prompt");
    } finally {
      setIsDeleting(false);
      setDeletePromptId(null);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <ConfigurePromptsStepHeader
        isCreatingPrompt={isCreatingPrompt}
        handlePromptCreate={handlePromptCreate}
        isImportingTemplate={isImportingTemplate}
      />
      <PromptList
        prompts={prompts}
        isLoading={isLoading}
        setDeletePromptId={setDeletePromptId}
      />
      <ConfirmationModal
        isOpen={!!deletePromptId}
        onClose={() => setDeletePromptId(null)}
        title="Delete Prompt"
        message="Are you sure you want to delete this prompt? This action cannot be undone."
        onConfirm={() => deletePromptId && handlePromptDelete(deletePromptId)}
        isLoading={isDeleting}
      />
      {/* <PromptContainerDialog /> */}
      {/* <TemplateSelectionPopup /> */}
    </div>
  )
}
