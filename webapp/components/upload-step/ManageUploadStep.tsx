"use client";

import React, { useCallback, useEffect, useState } from 'react'
import UploadStepHeader from './UploadStepHeader'
import { UploadStepBody } from './UploadStepBody';
import ConfirmationModal from '../ConfirmationModal';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Skeleton } from '../ui/skeleton';
import { Asset } from '@/server/db/schema';

interface ManageUploadStepProps {
  projectId: string;
};

function ManageUploadStep({projectId}: ManageUploadStepProps) {
  const [deleteAssetId, setDeleteAssetId] = React.useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedAssets, setUploadedAssets] = useState<Asset[]>([]);

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

  return (
    <div>
      <UploadStepHeader projectId={projectId} />
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
