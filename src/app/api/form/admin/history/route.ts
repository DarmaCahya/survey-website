import { NextRequest } from 'next/server';
import { withAdminPin } from '@/lib/admin-pin-service';
import { handleApiError, createSuccessResponse } from '@/lib/error-handler';
import { SubmissionRepository } from '@/lib/repositories';

const submissionRepository = new SubmissionRepository();

function parseNumber(value: string | null): number | undefined {
  if (!value) return undefined;
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? undefined : parsed;
}

async function getHistory(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const userId = parseNumber(searchParams.get('userId'));
    const userName = searchParams.get('userName') || undefined;
    const assetId = parseNumber(searchParams.get('assetId'));
    const threatId = parseNumber(searchParams.get('threatId'));
    const months = parseNumber(searchParams.get('months')) ?? 12;
    const page = parseNumber(searchParams.get('page')) ?? 1;
    const pageSize = parseNumber(searchParams.get('pageSize')) ?? 20;
    const sortParam = searchParams.get('sort');
    const sort = sortParam === 'asc' ? 'asc' : 'desc';
    const listUsers = searchParams.get('listUsers') === 'true';

    if (listUsers) {
      const users = await submissionRepository.findHistoryUsers({
        userName,
        months,
        page,
        pageSize
      });
      return createSuccessResponse(users, 'User list retrieved successfully');
    }

    const history = await submissionRepository.findHistory({
      userId,
      userName,
      assetId,
      threatId,
      months,
      page,
      pageSize,
      sort
    });

    return createSuccessResponse(history, 'Submission history retrieved successfully');
  } catch (error) {
    return handleApiError(error, 'Failed to retrieve submission history');
  }
}

export const GET = withAdminPin(getHistory);

