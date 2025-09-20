import { ChatInterface } from '@/components/chat/ChatInterface';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function ChatPage({
  searchParams,
}: {
  searchParams: { owner?: string; repo?: string; ref?: string };
}) {
  // Check authentication  
  const session = await auth.api.getSession({
    headers: {} as any
  } as Request);
  if (!session?.user) {
    redirect('/');
  }

  // Extract repository context from search params
  const repositoryContext = searchParams.owner && searchParams.repo ? {
    owner: searchParams.owner,
    repo: searchParams.repo,
    ref: searchParams.ref
  } : undefined;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Repository Assistant</h1>
          <p className="text-gray-600">
            Chat with an AI assistant that can analyze repositories, understand code patterns, 
            and provide deep insights using lynlang compiler analysis.
          </p>
          {repositoryContext && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h2 className="font-medium text-blue-900 mb-1">Repository Context</h2>
              <p className="text-blue-700">
                Currently analyzing: {repositoryContext.owner}/{repositoryContext.repo}
                {repositoryContext.ref && ` (${repositoryContext.ref})`}
              </p>
            </div>
          )}
        </div>

        <ChatInterface 
          repositoryContext={repositoryContext}
          className="mx-auto"
        />

        <div className="mt-8 text-sm text-gray-500">
          <h3 className="font-medium mb-2">Available Capabilities:</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-700 mb-1">Repository Analysis</h4>
              <ul className="space-y-1">
                <li>• Structure and organization analysis</li>
                <li>• File and code pattern search</li>
                <li>• Language and technology detection</li>
                <li>• Dependency mapping</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-1">Code Analysis (Lynlang)</h4>
              <ul className="space-y-1">
                <li>• AST generation and analysis</li>
                <li>• Pattern matching and detection</li>
                <li>• Code complexity assessment</li>
                <li>• Semantic code comparison</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded">
            <p className="text-amber-800 text-xs">
              <strong>Note:</strong> Lynlang analysis requires the lynlang compiler to be installed. 
              If unavailable, the assistant will provide fallback analysis using basic text processing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}