import React, { useEffect, useState } from 'react'
import ConfigurePromptsStepHeader from './ConfigurePromptsStepHeader'
import { useRouter, useSearchParams } from 'next/navigation';
import { Prompt } from '@/server/db/schema';
import axios from 'axios';
import toast from 'react-hot-toast';
import PromptList from './PromptList';


interface ConfigurePromptsStepProps {
  projectId: string;
}

export default function ConfigurePromptsStep({
  projectId,
}: ConfigurePromptsStepProps) {
  const [isLoading, setIsLoading] = useState(true);
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
      {/* <ConfirmationModal /> */}
      {/* <PromptContainerDialog /> */}
      {/* <TemplateSelectionPopup /> */}
    </div>
  )
}

