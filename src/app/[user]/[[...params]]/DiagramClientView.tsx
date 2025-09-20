"use client";
import React, { useState, useEffect, useMemo } from 'react';
import RepoPageLayout from '@/components/layouts/RepoPageLayout';
import { DiagramType } from '@/lib/types/diagram';
import { useDiagramGeneration } from '@/lib/hooks/useDiagramGeneration';
import { useRepoData } from '@/lib/hooks/useRepoData';
import {
  DiagramTypeSelector,
  DiagramControls,
  DiagramCodePanel,
  DiagramPreview,
  DiagramErrorHandler,
} from '@/components/diagram';
import { LoadingWave } from '@/components/LoadingWave';
import { UpgradePrompt } from '@/components/UpgradePrompt';
import { trpc } from '@/lib/trpc/client';
import { VersionDropdown } from '@/components/VersionDropdown';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

// Type definitions for diagram responses
type DiagramResponse = {
  diagramCode: string | null;
  format: string;
  diagramType: string;
  cached: boolean;
  stale: boolean;
  lastUpdated: string;
};

type DiagramDbRow = {
  id: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  ref: string | null;
  repoOwner: string;
  repoName: string;
  version: number;
  fileHashes: Record<string, string> | null;
  diagramType: string;
  diagramCode: string;
  format: string;
  options: Record<string, unknown> | null;
};

function hasValidDiagram(obj: DiagramResponse | DiagramDbRow | { diagramCode: null; cached: boolean; stale: boolean; lastUpdated: null } | null): obj is DiagramResponse | DiagramDbRow {
  return !!obj && 
         typeof obj === 'object' && 
         'diagramCode' in obj && 
         obj.diagramCode !== null &&
         'format' in obj &&
         'diagramType' in obj;
}

function DiagramClientView({ 
  user, 
  repo, 
  refName, 
  path
}: { 
  user: string; 
  repo: string; 
  refName?: string; 
  path?: string; 
}) {
  // State management
  const [diagramType, setDiagramType] = useState<DiagramType>('flowchart');
  const [options] = useState({});
  const [renderError, setRenderError] = useState<string>('');
  const [showCodePanel, setShowCodePanel] = useState(false);
  const [editableCode, setEditableCode] = useState('');
  const [lastCodePanelSize, setLastCodePanelSize] = useState(30);
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null);

  // Get repo data
  const { files: repoFiles, isLoading: filesLoading, error: filesError, totalFiles } = useRepoData({ user, repo, ref: refName, path });

  // Check user plan - works for both authenticated and guest users
  const { data: currentPlan, isLoading: planLoading } = trpc.user.getPublicPlan.useQuery(undefined, {
    retry: false, // Don't retry on failure
  });
  
  // Determine user access level
  const hasAccess = useMemo(() => {
    // Only users with active paid plans can generate diagrams
    return currentPlan?.plan === 'byok' || currentPlan?.plan === 'pro';
  }, [currentPlan?.plan]);
  
  const isGuest = useMemo(() => {
    return currentPlan?.plan === 'guest';
  }, [currentPlan?.plan]);

  // Fetch all available versions
  const { data: versions, isLoading: versionsLoading } = trpc.diagram.getDiagramVersions.useQuery({
    user,
    repo,
    ref: refName || 'main',
    diagramType,
  });

  // Use the public endpoint for cached diagram
  const { data: publicDiagram, isLoading: publicLoading } = selectedVersion
    ? trpc.diagram.getDiagramByVersion.useQuery({ user, repo, ref: refName || 'main', diagramType, version: selectedVersion }, { enabled: !!user && !!repo && !!diagramType && !!selectedVersion })
    : trpc.diagram.publicGetDiagram.useQuery({ user, repo, ref: refName || 'main', diagramType }, { enabled: !!user && !!repo && !!diagramType });

  // Check if repository is private or user lacks access
  const isPrivateRepo = (publicDiagram as { error?: string })?.error === 'This repository is private';
  const hasNoRepoAccess = (publicDiagram as { error?: string })?.error?.includes('do not have access') || 
                         (publicDiagram as { error?: string })?.error?.includes('Unable to access');

  // Memoize all inputs to useDiagramGeneration to prevent repeated requests
  const stableOptions = useMemo(() => options, [options]);
  const stableDiagramType = useMemo(() => diagramType, [diagramType]);

  // Diagram generation logic
  const {
    diagramCode,
    error,
    isPending,
    previousDiagramCode,
    handleRetry,
    handleRetryWithContext,
  } = useDiagramGeneration({
    user,
    repo,
    refName,
    path, // Pass the path
    diagramType: stableDiagramType,
    options: stableOptions,
    hasAccess, // Control execution with the access flag
  });

  // Display logic
  const displayDiagramCode = diagramCode || (error && previousDiagramCode ? previousDiagramCode : '');

  // Sync editableCode with diagramCode when diagramCode changes
  useEffect(() => {
    if (!showCodePanel && editableCode !== displayDiagramCode) {
      setEditableCode(displayDiagramCode);
    }
  }, [displayDiagramCode, showCodePanel, editableCode]);

  // Copy handlers
  const handleCopyMermaid = () => {
    navigator.clipboard.writeText(editableCode || displayDiagramCode);
  };

  const handleCopyDiagram = () => {
    const svg = document.querySelector('.mermaid svg');
    if (svg) {
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svg);
      navigator.clipboard.writeText(svgString);
    }
  };

  // Code change handler
  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditableCode(e.target.value);
  };

  // Panel toggle handler
  const handleToggleCodePanel = () => {
    setShowCodePanel((prev) => !prev);
  };

  // Add regenerate handler
  const handleRegenerate = () => {
    if (!repoFiles || repoFiles.length === 0) return;
    handleRetryWithContext();
  };

  // Type-narrow publicDiagram for rendering
  const validDiagram = publicDiagram && hasValidDiagram(publicDiagram) ? publicDiagram : null;

  // Show diagram if we have a valid cached diagram OR a newly generated diagram
  const diagramToShow = displayDiagramCode || (validDiagram?.diagramCode || '');
  
  // Debug logging
  console.log('DiagramClientView Debug:', {
    hasAccess,
    isGuest,
    currentPlan: currentPlan?.plan,
    isPending,
    error,
    displayDiagramCode: !!displayDiagramCode,
    repoFiles: repoFiles?.length,
    diagramType,
    isPrivateRepo,
    hasNoRepoAccess,
  });

  // If repository is private or user lacks access, show appropriate message
  if (isPrivateRepo || hasNoRepoAccess) {
    let errorMessage: string;
    
    if (isPrivateRepo) {
      if (isGuest) {
        errorMessage = "This repository is private. Sign in with GitHub to access private repositories you have permissions for.";
      } else {
        errorMessage = "This repository is private and you don't have access to it.";
      }
    } else {
      errorMessage = "You do not have access to this repository.";
    }
    
    return (
      <RepoPageLayout user={user} repo={repo} refName={refName} files={repoFiles} totalFiles={totalFiles}>
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <h2 className="text-xl font-semibold text-gray-600 mb-2">Access Restricted</h2>
          <p className="text-gray-500 text-center max-w-md">{errorMessage}</p>
          {isGuest && (
            <div className="mt-4">
              <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Sign in with GitHub
              </button>
            </div>
          )}
        </div>
      </RepoPageLayout>
    );
  }

  if (diagramToShow) {
    return (
      <RepoPageLayout user={user} repo={repo} refName={refName} files={repoFiles} totalFiles={totalFiles}>
        <div className="w-full px-0 text-center mt-8">
          <VersionDropdown
            versions={versions}
            isLoading={versionsLoading}
            selectedVersion={selectedVersion}
            onVersionChange={setSelectedVersion}
          />
          
          <h1>Diagram View</h1>
          <div className="mb-4">
            <DiagramTypeSelector
              diagramType={diagramType}
              onDiagramTypeChange={setDiagramType}
              disabled={publicLoading || isPending}
            />
            
            {hasAccess && (
              <div className="flex justify-center mt-4">
                <Button
                  onClick={handleRegenerate}
                  disabled={isPending}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${isPending ? 'animate-spin' : ''}`} />
                  {isPending ? 'Generating...' : 'Regenerate'}
                </Button>
              </div>
            )}
          </div>
          
          <div className="w-full bg-white border rounded-lg shadow overflow-hidden mt-8" style={{minHeight: 500}}>
            <DiagramControls
              showCodePanel={showCodePanel}
              onToggleCodePanel={handleToggleCodePanel}
              onCopyMermaid={handleCopyMermaid}
              onCopyDiagram={handleCopyDiagram}
              onRegenerate={(renderError) => handleRetryWithContext(renderError)}
              renderError={renderError}
              disabled={isPending}
            />
            <DiagramCodePanel
              showCodePanel={showCodePanel}
              editableCode={editableCode || diagramToShow}
              onCodeChange={handleCodeChange}
              lastCodePanelSize={lastCodePanelSize}
              onCodePanelSizeChange={setLastCodePanelSize}
              disabled={publicLoading || isPending}
            >
              <DiagramPreview
                code={editableCode || diagramToShow}
                renderError={renderError}
                onRenderError={setRenderError}
              />
            </DiagramCodePanel>
          </div>
        </div>
      </RepoPageLayout>
    );
  }

  // Show loading state while files are loading
  if (filesLoading || publicLoading || planLoading) {
    return (
      <RepoPageLayout user={user} repo={repo} refName={refName} files={repoFiles} totalFiles={totalFiles}>
        <div className="w-full px-4 py-8">
          <div className="flex flex-col items-center gap-4">
            <LoadingWave size="lg" color="#3b82f6" />
            <div className="text-lg text-blue-700 font-medium">Loading repository files...</div>
          </div>
        </div>
      </RepoPageLayout>
    );
  }

  // Show error state if files failed to load
  if (filesError) {
    return (
      <RepoPageLayout user={user} repo={repo} refName={refName} files={repoFiles} totalFiles={totalFiles}>
        <div className="w-full px-4 py-8">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-red-600 mb-2">Repository Not Found</h2>
            <p className="text-gray-600">The repository <code className="bg-gray-100 px-2 py-1 rounded">{user}/{repo}</code> could not be found or accessed.</p>
            <p className="text-sm text-gray-500 mt-2">Please check the repository name and ensure it exists and is public.</p>
            {String(filesError).includes('404') && (
              <p className="text-xs text-gray-400 mt-2">Error: Repository not found (404)</p>
            )}
          </div>
        </div>
      </RepoPageLayout>
    );
  }

  return (
    <RepoPageLayout user={user} repo={repo} refName={refName} files={repoFiles} totalFiles={totalFiles}>
      <div className="w-full px-0 text-center mt-8">
        <VersionDropdown
          versions={versions}
          isLoading={versionsLoading}
          selectedVersion={selectedVersion}
          onVersionChange={setSelectedVersion}
        />
        
        <h1>Diagram View</h1>
        <div className="mb-4">
          <DiagramTypeSelector
            diagramType={diagramType}
            onDiagramTypeChange={setDiagramType}
            disabled={isPending}
          />
          
          {hasAccess && (
            <div className="flex justify-center mt-4">
              <Button
                onClick={() => handleRetryWithContext()}
                disabled={isPending}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isPending ? 'animate-spin' : ''}`} />
                {isPending ? 'Generating...' : 'Regenerate'}
              </Button>
            </div>
          )}
        </div>
        
        {isPending && (
          <div className="my-8 flex flex-col items-center gap-4">
            <LoadingWave size="lg" color="#3b82f6" />
            <div className="text-lg text-blue-700 font-medium">Generating {diagramType} diagram...</div>
            <div className="text-sm text-gray-500">This may take a few moments</div>
          </div>
        )}
        
        <DiagramErrorHandler
          error={error}
          isPending={isPending}
          previousDiagramCode={previousDiagramCode}
          onRetry={handleRetry}
          onRetryWithContext={handleRetryWithContext}
        />
        
        {!isPending && !displayDiagramCode && !error && (
          <div className="text-center mt-8">
            <p className="text-gray-500 mb-4">No diagram generated yet.</p>
            {hasAccess ? (
              repoFiles && repoFiles.length > 0 ? (
                <p className="text-sm text-gray-400">Click &quot;Regenerate&quot; to generate a diagram, or select a different diagram type.</p>
              ) : (
                <p className="text-sm text-gray-400">No files found in repository. Please check the repository path.</p>
              )
            ) : isGuest ? (
              <p className="text-sm text-gray-400">Sign in and upgrade your plan to generate diagrams.</p>
            ) : (
              <p className="text-sm text-gray-400">Upgrade your plan to generate diagrams.</p>
            )}
          </div>
        )}
        
        {/* Show upgrade prompt if user doesn't have access */}
        {!hasAccess && !isGuest && (
          <div className="mt-8">
            <UpgradePrompt feature="diagram" />
          </div>
        )}
        
        {/* Show sign in prompt for guests */}
        {isGuest && (
          <div className="mt-8 text-center">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Sign In to Generate Diagrams</h3>
              <p className="text-blue-700 mb-4">
                You can view existing diagrams, but diagram generation requires a GitHub account and active subscription.
              </p>
              <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Sign in with GitHub
              </button>
            </div>
          </div>
        )}
      </div>
    </RepoPageLayout>
  );
}

export default DiagramClientView;
