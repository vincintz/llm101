import React, { useState } from 'react'
import ConfigurePromptsStepHeader from './ConfigurePromptsStepHeader'
import { useRouter } from 'next/navigation';
import { Prompt } from '@/server/db/schema';
import axios from 'axios';
import toast from 'react-hot-toast';


interface ConfigurePromptsStepProps {
  projectId: string;
}

export default function ConfigurePromptsStep({
  projectId,
}: ConfigurePromptsStepProps) {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [isCreatingPrompt, setIsCreatingPrompt] = useState(false);
  const [isImportingTemplate, setIsImportingTemplate] = useState(false);
  const router = useRouter();

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
    <div>
      <ConfigurePromptsStepHeader
        isCreatingPrompt={isCreatingPrompt}
        handlePromptCreate={handlePromptCreate}
        isImportingTemplate={isImportingTemplate}
      />
      {/* <PromptsList /> */}
      {/* <ConfirmationModal /> */}
      {/* <PromptContainerDialog /> */}
      {/* <TemplateSelectionPopup /> */}
    </div>
  )
}

