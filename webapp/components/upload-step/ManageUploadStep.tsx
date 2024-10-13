"use client";

import React, { useCallback, useEffect, useRef, useState } from 'react'
import UploadStepHeader from './UploadStepHeader'
import { UploadStepBody } from './UploadStepBody';
import ConfirmationModal from '../ConfirmationModal';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Skeleton } from '../ui/skeleton';
import { Asset } from '@/server/db/schema';
import { upload } from '@vercel/blob/client';

interface ManageUploadStepProps {
  projectId: string;
};

function ManageUploadStep({projectId}: ManageUploadStepProps) {
  const [deleteAssetId, setDeleteAssetId] = React.useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedAssets, setUploadedAssets] = useState<Asset[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);
  const [browserFiles, setBrowserFiles] = useState<File[]>([]);

  const inputFileRef = useRef<HTMLInputElement>(null);

  const fetchAssets = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get<Asset[]>(
        `/api/projects/${projectId}/assets`
      );
      setUploadedAssets(response.data);
      console.log(">", response.data);
    } catch (error) {
      console.error("Failed to fetch assets", error);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  if (isLoading) {
    return (
      <div className="space-y-2 sm:space-y-3 md:space-y-4">
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-10 w-full rounded-xl" />
      </div>
    );
  }

  const handleUpload = async () => {
    setUploading(true);
    try {
      const uploadPromises = browserFiles.map(async (file) => {
        const fileData = {
          projectId,
          title: file.name,
          fileType: getFileType(file),
          mimeType: file.type,
          size: file.size,
        };

        const filename = `${projectId}/${file.name}`;
        const result = await upload(filename, file, {
          access: "public",
          handleUploadUrl: "/api/upload",
          multipart: true,
          clientPayload: JSON.stringify(fileData),
        });

        return result;
      });

      const uploadResults = await Promise.all(uploadPromises);
      toast.success(`Files uploaded ${uploadResults.length} successfully`);
      setBrowserFiles([]);
      if (inputFileRef.current) {
        inputFileRef.current.value = "";
      }
      fetchAssets();

    } catch (error) {
      console.log("Error in upload process:", error);
      toast.error("Failed to upload one or more files. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await axios.delete(
        `/api/projects/${projectId}/assets?assetId=${deleteAssetId}`
      );
      toast.success("Asset deleted successfully.");
      fetchAssets();
    } catch (error) {
      console.error("Failed to delete asset", error);
      toast.error("Failed to delete asset");
    } finally {
      setIsDeleting(false);
      setDeleteAssetId(null);
    }
  };

  const getFileType = (file: File) => {
    if (file.type.startsWith("video/")) return "video";
    if (file.type.startsWith("audio/")) return "audio";
    if (file.type === "text/plain") return "text";
    if (file.type === "text/markdown") return "markdown";
    return "other";
  };

  return (
    <div>
      <UploadStepHeader
        browserFiles={browserFiles}
        setBrowserFiles={setBrowserFiles}
        inputFileRef={inputFileRef}
        handleUpload={handleUpload}
        uploading={uploading}
      />
      <UploadStepBody
        isLoading={isLoading}
        setDeleteAssetId={setDeleteAssetId}
        uploadedAssets={uploadedAssets}
      />
      <ConfirmationModal
        isOpen={!!deleteAssetId}
        title="Delete Asset"
        message="Are you sure you want to delete this asset? This action cannot be undone."
        onClose={() => {setDeleteAssetId(null)}}
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </div>
  )
}

export default ManageUploadStep
