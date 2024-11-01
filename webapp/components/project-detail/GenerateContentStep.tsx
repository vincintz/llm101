"use client";

import { useEffect, useState } from 'react'
import GenerateStepBody from '../GenerateStepBody';
import GenerateStepHeader from '../GenerateStepHeader';
import { Asset, GeneratedContent, Prompt } from '@/server/db/schema';
import axios from 'axios';
import { MAX_TOKENS_ASSETS, MAX_TOKENS_PROMPT } from '@/lib/constants';
import toast from 'react-hot-toast';

interface GenerateContentStepProps {
  projectId: string;
};

function GenerateContentStep({
  projectId,
}: GenerateContentStepProps) {
  const [canGenerate, setCanGenerate] = useState(false);
  const [projectHasContent, setProjectHasContent] = useState(false);
  const [projectHasPrompts, setProjectHasPrompts] = useState(false);
  const [isAssetsTokenExceeded, setIsAssetsTokenExceeded] = useState(false);
  const [isPromptsTokenExceeded, setIsPromptsTokenExceeded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent[]>(
    []
  );
  const [generatedCount, setGeneratedCount] = useState(0);
  const [totalPrompts, setTotalPrompts] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const canGenerate = projectHasPrompts &&
      !isAssetsTokenExceeded &&
      !isPromptsTokenExceeded &&
      !isLoading &&
      !isGenerating;

    setCanGenerate(canGenerate);
  }, [
    isAssetsTokenExceeded,
    isGenerating,
    isLoading,
    isPromptsTokenExceeded,
    projectHasContent,
    projectHasPrompts,
  ]);

  useEffect(() => {
    const fetchAllProjectData = async () => {
      setIsLoading(true);
      try {
        const [generatedContentResponse, assetsResponse, promptsResponse] = await Promise.all([
          axios.get<GeneratedContent[]>(
            `/api/projects/${projectId}/generated-content`
          ),
          axios.get<Asset[]>(`/api/projects/${projectId}/assets`),
          axios.get<Prompt[]>(`/api/projects/${projectId}/prompts`),
        ]);

        setGeneratedContent(generatedContentResponse.data);
        setGeneratedCount(generatedContentResponse.data.length);

        setProjectHasContent(
          assetsResponse.data.some(
            (asset) => asset.content && asset.content.trim().length > 0
          )
        );
        setProjectHasPrompts(promptsResponse.data.length > 0);
        setTotalPrompts(promptsResponse.data.length);

        // Check to make sure we don't exceed asset token limits
        let totalTokenCount = 0;
        for (const asset of assetsResponse.data) {
          totalTokenCount += asset.tokenCount ?? 0;
        }

        setIsAssetsTokenExceeded(totalTokenCount > MAX_TOKENS_ASSETS);

        // Check to make sure we don't exceed prompt token limits
        for (const prompt of promptsResponse.data) {
          if ((prompt?.tokenCount ?? 0) > MAX_TOKENS_PROMPT) {
            setIsPromptsTokenExceeded(true);
            break;
          }
        }
      } catch (error) {
        toast.error("Failed to fetch project data");
        setProjectHasContent(false);
        setProjectHasPrompts(false);
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllProjectData();
  }, [projectId]);

  useEffect(() => {
    let newErrorMessage = null;

    if (!projectHasContent || !projectHasPrompts) {
      const missingItems = [];
      if (!projectHasContent) missingItems.push("valid assets");
      if (!projectHasPrompts) missingItems.push("add prompts");

      newErrorMessage = `Please ${missingItems.join(
        " and "
      )} before generating content.`;
    } else if (isAssetsTokenExceeded || isPromptsTokenExceeded) {
      const exceededItems = [];
      if (isAssetsTokenExceeded) exceededItems.push("assets");
      if (isPromptsTokenExceeded) exceededItems.push("prompts");

      newErrorMessage = `Your ${exceededItems.join(
        " and "
      )} exceed the maximum token limit. Please reduce the size of your ${exceededItems.join(
        " or "
      )}.`;
    }

    setErrorMessage(newErrorMessage);
  }, [
    isAssetsTokenExceeded,
    isPromptsTokenExceeded,
    projectHasContent,
    projectHasPrompts,
  ]);

  const startGeneration = async () => {
    setIsGenerating(true);
    try {
      await axios.post<GeneratedContent[]>(
        `/api/projects/${projectId}/generated-content`
      );
    } catch (error) {
      console.log(error);
      toast.error("Failed to generate content");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div>
      <GenerateStepHeader
        canGenerateContent={canGenerate}
        startGeneration={startGeneration}
      />
      <GenerateStepBody
        isLoading={isLoading}
        isGenerating={isGenerating}
        generatedCount={generatedCount}
        totalPrompts={totalPrompts}
        errorMessage={errorMessage}
        generatedContent={generatedContent}
      />
    </div>
  )
}

export default GenerateContentStep;
