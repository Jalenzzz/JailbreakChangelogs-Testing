import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import React, { useState, useEffect, useCallback } from 'react';
import {
  CircularProgress,
  TextField,
  Button,
  IconButton,
  Pagination,
  Menu,
  MenuItem,
  Tooltip,
} from '@mui/material';
import { PUBLIC_API_URL, CommentData } from '@/utils/api';
import { UserAvatar } from '@/utils/avatar';
import {
  PencilIcon,
  TrashIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  EllipsisHorizontalIcon,
  ChatBubbleLeftIcon,
  FlagIcon,
} from '@heroicons/react/24/outline';
import { BiSolidSend } from 'react-icons/bi';
import { FaSignInAlt } from 'react-icons/fa';
import { useAuthContext } from '@/contexts/AuthContext';
import { UserData } from '@/types/auth';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import ReportCommentModal from './ReportCommentModal';
import LoginModalWrapper from '../Auth/LoginModalWrapper';
import { convertUrlsToLinks } from '@/utils/urlConverter';
import SupporterModal from '../Modals/SupporterModal';
import { useSupporterModal } from '@/hooks/useSupporterModal';
import { UserDetailsTooltip } from '@/components/Users/UserDetailsTooltip';
import { UserBadges } from '@/components/Profile/UserBadges';
import CommentTimestamp from './CommentTimestamp';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

const COMMENT_CHAR_LIMITS = {
  0: 200, // Free tier
  1: 400, // Supporter tier 1
  2: 800, // Supporter tier 2
  3: 2000, // Supporter tier 3
} as const;

const getCharLimit = (tier: keyof typeof COMMENT_CHAR_LIMITS): number => {
  const limit = COMMENT_CHAR_LIMITS[tier];
  return limit;
};

const isCommentEditable = (commentDate: string): boolean => {
  const commentTime = parseInt(commentDate);
  const currentTime = Math.floor(Date.now() / 1000);
  const oneHourInSeconds = 3600;
  return currentTime - commentTime <= oneHourInSeconds;
};

interface ChangelogCommentsProps {
  changelogId: number;
  changelogTitle: string;
  type: 'changelog' | 'season' | 'item' | 'trade';
  itemType?: string;
  trade?: {
    author: string;
  };
  initialComments?: CommentData[];
  initialUserMap?: Record<string, UserData>;
}

const cleanCommentText = (text: string): string => {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join('\n');
};

const ChangelogComments: React.FC<ChangelogCommentsProps> = ({
  changelogId,
  changelogTitle,
  type,
  itemType,
  trade,
  initialComments = [],
  initialUserMap = {},
}) => {
  const [comments, setComments] = useState<CommentData[]>(initialComments);
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userData, setUserData] = useState<Record<string, UserData>>(initialUserMap);
  const [loadingUserData, setLoadingUserData] = useState<Record<string, boolean>>({});
  const [failedUserData, setFailedUserData] = useState<Set<string>>(new Set());
  const [currentUserPremiumType, setCurrentUserPremiumType] = useState<number>(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { isAuthenticated, user } = useAuthContext();
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const commentsPerPage = 7;
  const [expandedComments, setExpandedComments] = useState<Set<number>>(new Set());
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedCommentId, setSelectedCommentId] = useState<number | null>(null);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportingCommentId, setReportingCommentId] = useState<number | null>(null);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [postSnackbarOpen, setPostSnackbarOpen] = useState(false);
  const [postSnackbarMsg, setPostSnackbarMsg] = useState('');
  const [postErrorSnackbarOpen, setPostErrorSnackbarOpen] = useState(false);
  const [postErrorSnackbarMsg, setPostErrorSnackbarMsg] = useState('');
  const [editSnackbarOpen, setEditSnackbarOpen] = useState(false);
  const [editSnackbarMsg, setEditSnackbarMsg] = useState('');
  const [globalErrorSnackbarOpen, setGlobalErrorSnackbarOpen] = useState(false);
  const [globalErrorSnackbarMsg, setGlobalErrorSnackbarMsg] = useState('');
  const [infoSnackbarOpen, setInfoSnackbarOpen] = useState(false);
  const [infoSnackbarMsg, setInfoSnackbarMsg] = useState('');

  // Supporter modal hook
  const { modalState, closeModal, checkCommentLength } = useSupporterModal();

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  useEffect(() => {
    // Check if user is logged in
    setIsLoggedIn(!!isAuthenticated);

    // Get current user ID and premium type from auth hook
    if (user) {
      setCurrentUserId(user.id);
      setCurrentUserPremiumType(user.premiumtype || 0);
    } else {
      setCurrentUserId(null);
      setCurrentUserPremiumType(0);
    }

    const handleAuthChange = (event: CustomEvent) => {
      const userData = event.detail;
      if (userData) {
        setIsLoggedIn(true);
        setCurrentUserId(userData.id);
        setCurrentUserPremiumType(userData.premiumtype || 0);
      } else {
        setIsLoggedIn(false);
        setCurrentUserId(null);
        setCurrentUserPremiumType(0);
      }
    };

    // Listen for auth changes
    window.addEventListener('authStateChanged', handleAuthChange as EventListener);

    return () => {
      window.removeEventListener('authStateChanged', handleAuthChange as EventListener);
    };
  }, [isAuthenticated, user]);

  const fetchUserData = useCallback(
    async (userIds: string[]) => {
      if (userIds.length === 0) return;

      // Filter out users we already have data for, are loading, or have failed
      const usersToFetch = userIds.filter(
        (userId) => !userData[userId] && !loadingUserData[userId] && !failedUserData.has(userId),
      );

      if (usersToFetch.length === 0) return;

      try {
        setLoadingUserData((prev) => {
          const newState = { ...prev };
          usersToFetch.forEach((userId) => {
            newState[userId] = true;
          });
          return newState;
        });

        const response = await fetch(
          `${PUBLIC_API_URL}/users/get/batch?ids=${usersToFetch.join(',')}&nocache=true`,
        );
        if (!response.ok) throw new Error('Failed to fetch user data');
        const data = await response.json();

        setUserData((prev) => {
          const newState = { ...prev };
          data.forEach((user: UserData) => {
            newState[user.id] = user;
          });
          return newState;
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
        setFailedUserData((prev) => {
          const newSet = new Set(prev);
          usersToFetch.forEach((userId) => {
            newSet.add(userId);
          });
          return newSet;
        });
      } finally {
        setLoadingUserData((prev) => {
          const newState = { ...prev };
          usersToFetch.forEach((userId) => {
            newState[userId] = false;
          });
          return newState;
        });
      }
    },
    [userData, loadingUserData, failedUserData],
  );

  // Function to refresh comments from server
  const refreshComments = useCallback(async () => {
    try {
      const endpoint = `${PUBLIC_API_URL}/comments/get?type=${type === 'item' ? itemType : type}&id=${changelogId}&nocache=true`;
      const response = await fetch(endpoint);

      if (response.status === 404) {
        setComments([]);
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }

      const data = await response.json();
      const commentsArray = Array.isArray(data) ? data : [];
      setComments(commentsArray);

      // Fetch user data for new comments
      if (commentsArray.length > 0) {
        const userIds = commentsArray.map((comment) => comment.user_id);
        fetchUserData(userIds);
      }
    } catch (err) {
      console.error('Error refreshing comments:', err);
    }
  }, [changelogId, type, itemType, fetchUserData]);

  // Initialize comments with server-side data
  useEffect(() => {
    if (isMounted) {
      setInitialLoadComplete(true);
    }
  }, [isMounted]);

  // Refresh comments when changelogId changes (for quick nav navigation)
  useEffect(() => {
    if (isMounted && initialLoadComplete) {
      refreshComments();
    }
  }, [changelogId, isMounted, initialLoadComplete, refreshComments]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn || !newComment.trim() || isSubmittingComment) return;

    // Check if comment length exceeds user's tier limit
    if (!checkCommentLength(newComment, currentUserPremiumType)) {
      if (currentUserPremiumType >= 3 && newComment.length > 2000) {
        setGlobalErrorSnackbarMsg('Comment is too long. Maximum length is 2000 characters.');
        setGlobalErrorSnackbarOpen(true);
      }
      return; // Modal will be shown by the hook for lower tiers
    }

    setIsSubmittingComment(true);

    try {
      const response = await fetch(`/api/comments/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: cleanCommentText(newComment),
          item_id: changelogId,
          item_type: type === 'item' ? itemType : type,
        }),
      });

      if (response.status === 429) {
        setPostErrorSnackbarMsg(
          "Slow down! You're posting too fast. Take a breather and try again in a moment.",
        );
        setPostErrorSnackbarOpen(true);
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to post comment');
      }

      setPostSnackbarMsg('Comment posted successfully. You have 1 hour to edit your comment.');
      setPostSnackbarOpen(true);
      setNewComment('');
      refreshComments();
    } catch (err) {
      setGlobalErrorSnackbarMsg(err instanceof Error ? err.message : 'Failed to post comment');
      setGlobalErrorSnackbarOpen(true);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleEditComment = async (commentId: number) => {
    if (!editContent.trim()) return;

    // Find the original comment to compare content
    const originalComment = filteredComments.find((c) => c.id === commentId);
    if (!originalComment) return;

    // Check if content has actually changed
    if (cleanCommentText(editContent) === originalComment.content) {
      // No changes made, just close the edit mode
      setEditingCommentId(null);
      setEditContent('');
      return;
    }

    // Check if edit content length exceeds user's tier limit
    if (!checkCommentLength(editContent, currentUserPremiumType)) {
      if (currentUserPremiumType >= 3 && editContent.length > 2000) {
        setGlobalErrorSnackbarMsg('Comment is too long. Maximum length is 2000 characters.');
        setGlobalErrorSnackbarOpen(true);
      }
      return; // Modal will be shown by the hook for lower tiers
    }

    try {
      const response = await fetch(`/api/comments/edit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: commentId,
          content: cleanCommentText(editContent),
          item_type: type,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to edit comment');
      }
      setEditSnackbarMsg('Comment edited successfully.');
      setEditSnackbarOpen(true);
      setEditingCommentId(null);
      setEditContent('');
      refreshComments();
    } catch (err) {
      setGlobalErrorSnackbarMsg(err instanceof Error ? err.message : 'Failed to edit comment');
      setGlobalErrorSnackbarOpen(true);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    // Optimistically remove from UI
    setComments((prev) => prev.filter((c) => c.id !== commentId));

    try {
      const response = await fetch(`/api/comments/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: commentId, item_type: type }),
      });
      if (!response.ok) {
        throw new Error('Failed to delete comment');
      }
      // Comment successfully deleted, no need to refresh since we already removed it optimistically
    } catch (err) {
      // If deletion failed, restore the comment
      setComments((prev) => {
        const originalComment = comments.find((c) => c.id === commentId);
        return originalComment ? [originalComment, ...prev] : prev;
      });
      setGlobalErrorSnackbarMsg(err instanceof Error ? err.message : 'Failed to delete comment');
      setGlobalErrorSnackbarOpen(true);
    }
  };

  // Sort comments based on sortOrder
  const sortedComments = [...comments].sort((a, b) => {
    const dateA = parseInt(a.date);
    const dateB = parseInt(b.date);
    return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
  });

  // Filter out comments from users whose data fetch failed
  const filteredComments = sortedComments.filter((comment) => !failedUserData.has(comment.user_id));

  // Calculate pagination with filtered comments
  const indexOfLastComment = currentPage * commentsPerPage;
  const indexOfFirstComment = indexOfLastComment - commentsPerPage;
  const currentComments = filteredComments.slice(indexOfFirstComment, indexOfLastComment);
  const totalPages = Math.ceil(filteredComments.length / commentsPerPage);

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
  };

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === 'newest' ? 'oldest' : 'newest'));
    setCurrentPage(1); // Reset to first page when changing sort order
  };

  const toggleCommentExpand = (commentId: number) => {
    setExpandedComments((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, commentId: number) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedCommentId(commentId);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedCommentId(null);
  };

  const handleEditClick = () => {
    if (selectedCommentId) {
      const comment = filteredComments.find((c) => c.id === selectedCommentId);
      if (comment) {
        setEditingCommentId(selectedCommentId);
        setEditContent(comment.content);
      }
    }
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    if (selectedCommentId) {
      handleDeleteComment(selectedCommentId);
    }
    handleMenuClose();
  };

  const handleReportClick = () => {
    if (!isAuthenticated) {
      setGlobalErrorSnackbarMsg('You must be logged in to report comments');
      setGlobalErrorSnackbarOpen(true);
      setLoginModalOpen(true);
      return;
    }

    if (selectedCommentId) {
      setReportingCommentId(selectedCommentId);
      setReportModalOpen(true);
    }
    handleMenuClose();
  };

  const handleReportSubmit = async (reason: string) => {
    if (!reason.trim() || !reportingCommentId) return;

    try {
      const response = await fetch(`/api/comments/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comment_id: reportingCommentId, reason: reason.trim() }),
      });

      if (!response.ok) {
        throw new Error('Failed to report comment');
      }

      setInfoSnackbarMsg('We have successfully received your report');
      setInfoSnackbarOpen(true);
      setReportModalOpen(false);
      setReportReason('');
      setReportingCommentId(null);
    } catch (err) {
      setGlobalErrorSnackbarMsg(err instanceof Error ? err.message : 'Failed to report comment');
      setGlobalErrorSnackbarOpen(true);
    }
  };

  return (
    <div className="space-y-2 sm:space-y-3">
      <div className="border-border-primary bg-secondary-bg rounded-lg border p-2 sm:p-3">
        <div className="flex flex-col gap-4">
          <div>
            <h2
              className={`${inter.className} text-primary-text mb-4 text-lg font-bold tracking-tight sm:text-xl`}
            >
              {type === 'changelog' ? (
                `Comments for Changelog ${changelogId}: ${changelogTitle}`
              ) : type === 'season' ? (
                `Comments for Season ${changelogId}: ${changelogTitle}`
              ) : type === 'trade' ? (
                `Comments for Trade #${changelogId}`
              ) : (
                <>
                  Comments for {changelogTitle}{' '}
                  <span className="text-secondary-text">({itemType})</span>
                </>
              )}
            </h2>
          </div>

          {/* New Comment Form */}
          <form onSubmit={handleSubmitComment} className="mb-2">
            <TextField
              fullWidth
              multiline
              minRows={3}
              maxRows={10}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={isLoggedIn ? 'Write a comment...' : 'Please log in to comment'}
              variant="outlined"
              helperText={!isLoggedIn ? 'You must be logged in to comment' : ' '}
              disabled={!isLoggedIn}
              size="small"
              slotProps={{
                input: {
                  autoCorrect: 'off',
                  autoComplete: 'off',
                  spellCheck: 'false',
                  autoCapitalize: 'off',
                  className: '[&_textarea]:resize-y',
                },
              }}
              className="[&_.MuiFormHelperText-root]:text-secondary-text [&_.MuiFormHelperText-root.Mui-disabled]:text-secondary-text [&_.MuiFormHelperText-root.Mui-error]:text-button-danger [&_.MuiInputBase-root]:bg-form-input [&_.MuiInputBase-root.Mui-disabled]:bg-primary-bg [&_.MuiInputBase-root.Mui-disabled_.MuiOutlinedInput-notchedOutline]:border-secondary-bg [&_.MuiInputBase-root.Mui-disabled_.MuiInputBase-input]:text-secondary-text [&_.MuiInputBase-input]:text-primary-text [&_.MuiInputBase-input::placeholder]:text-secondary-text [&_.MuiOutlinedInput-notchedOutline]:border-stroke [&_.MuiInputBase-root:hover_.MuiOutlinedInput-notchedOutline]:border-button-info [&_.MuiInputBase-root.Mui-focused_.MuiOutlinedInput-notchedOutline]:border-button-info"
            />
            <div className="mt-2 flex items-center justify-between">
              <button
                onClick={toggleSortOrder}
                className="border-stroke bg-button-info text-form-button-text hover:bg-button-info-hover flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm transition-colors"
              >
                {sortOrder === 'newest' ? (
                  <ArrowDownIcon className="h-4 w-4" />
                ) : (
                  <ArrowUpIcon className="h-4 w-4" />
                )}
                {sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}
              </button>
              <button
                type="submit"
                disabled={isLoggedIn && (!newComment.trim() || isSubmittingComment)}
                onClick={
                  !isLoggedIn
                    ? (e) => {
                        e.preventDefault();
                        setLoginModalOpen(true);
                      }
                    : undefined
                }
                className={`flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
                  isSubmittingComment
                    ? 'bg-button-info-disabled text-form-button-text border-button-info-disabled cursor-progress'
                    : isLoggedIn && !newComment.trim()
                      ? 'bg-button-secondary text-secondary-text border-button-secondary cursor-not-allowed'
                      : 'bg-button-info text-form-button-text border-button-info hover:bg-button-info-hover cursor-pointer'
                }`}
              >
                {isLoggedIn ? (
                  isSubmittingComment ? (
                    <>
                      <CircularProgress size={16} className="text-form-button-text" />
                      Posting...
                    </>
                  ) : (
                    <>
                      <BiSolidSend className="h-4 w-4" />
                      Post Comment
                    </>
                  )
                ) : (
                  <>
                    <FaSignInAlt className="h-4 w-4" />
                    Login to Comment
                  </>
                )}
              </button>
            </div>
            {isLoggedIn && (
              <div className="mt-2 text-center">
                <span className="text-secondary-text text-xs">
                  Tip: Comments can be edited within 1 hour of posting
                </span>
              </div>
            )}
          </form>

          {/* Comments List */}
          {filteredComments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center sm:py-16">
              <div className="relative mb-6">
                <div className="from-border-focus/20 to-button-info-hover/20 absolute inset-0 rounded-full bg-gradient-to-r blur-xl"></div>
                <div className="border-border-focus/30 bg-secondary-bg relative rounded-full border p-4">
                  <ChatBubbleLeftIcon className="text-border-focus h-8 w-8 sm:h-10 sm:w-10" />
                </div>
              </div>
              <h3 className="text-primary-text mb-2 text-lg font-semibold sm:text-xl">
                No comments yet
              </h3>
              <p className="text-secondary-text max-w-md text-sm leading-relaxed sm:text-base">
                Be the first to share your thoughts on this{' '}
                {type === 'changelog'
                  ? 'changelog'
                  : type === 'season'
                    ? 'season'
                    : type === 'trade'
                      ? 'trade ad'
                      : 'item'}
                !
              </p>
            </div>
          ) : (
            <>
              <div className="bg-tertiary-bg rounded-xl p-2">
                <div className="space-y-2 sm:space-y-3">
                  {currentComments.map((comment) => {
                    const flags = userData[comment.user_id]?.flags || [];
                    const premiumType = userData[comment.user_id]?.premiumtype;
                    const hideRecent =
                      userData[comment.user_id]?.settings?.show_recent_comments === 0 &&
                      currentUserId !== comment.user_id;
                    return (
                      <div
                        key={comment.id}
                        className="group hover:border-border-focus border-border-tertiary relative overflow-hidden rounded-lg border p-3 transition-all duration-200"
                      >
                        {/* Header Section */}
                        <div className="flex items-center justify-between pb-2">
                          <div className="flex items-center gap-3">
                            {loadingUserData[comment.user_id] ? (
                              <div className="bg-tertiary-bg ring-border-focus/20 flex h-10 w-10 items-center justify-center rounded-full ring-2">
                                <CircularProgress size={20} className="text-border-focus" />
                              </div>
                            ) : hideRecent ? (
                              <div className="border-border-primary bg-primary-bg ring-tertiary-text/20 flex h-10 w-10 items-center justify-center rounded-full border ring-2">
                                <svg
                                  className="text-secondary-text h-5 w-5"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                  />
                                </svg>
                              </div>
                            ) : (
                              <div className="group-hover:ring-border-focus/20 rounded-full ring-2 ring-transparent transition-all duration-200">
                                <UserAvatar
                                  userId={comment.user_id}
                                  avatarHash={userData[comment.user_id]?.avatar}
                                  username={userData[comment.user_id]?.username || comment.author}
                                  size={10}
                                  accent_color={userData[comment.user_id]?.accent_color}
                                  custom_avatar={userData[comment.user_id]?.custom_avatar}
                                  showBadge={false}
                                  settings={userData[comment.user_id]?.settings}
                                  premiumType={userData[comment.user_id]?.premiumtype}
                                />
                              </div>
                            )}

                            <div className="flex min-w-0 flex-col">
                              <div className="flex flex-wrap items-center gap-2">
                                {loadingUserData[comment.user_id] ? (
                                  <>
                                    <div className="bg-primary-bg h-5 w-30 animate-pulse rounded" />
                                    <div className="bg-primary-bg h-4 w-20 animate-pulse rounded" />
                                  </>
                                ) : hideRecent ? (
                                  <div className="flex items-center gap-2">
                                    <svg
                                      className="text-secondary-text h-4 w-4"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                      />
                                    </svg>
                                    <span className="text-secondary-text text-sm font-medium">
                                      Hidden User
                                    </span>
                                  </div>
                                ) : (
                                  <>
                                    <div className="flex items-center gap-2">
                                      <Tooltip
                                        title={
                                          userData[comment.user_id] && (
                                            <UserDetailsTooltip user={userData[comment.user_id]} />
                                          )
                                        }
                                        arrow
                                        disableTouchListener
                                        slotProps={{
                                          tooltip: {
                                            sx: {
                                              backgroundColor: 'var(--color-primary-bg)',
                                              color: 'var(--color-primary-text)',
                                              '& .MuiTooltip-arrow': {
                                                color: 'var(--color-primary-bg)',
                                              },
                                            },
                                          },
                                        }}
                                      >
                                        <Link
                                          href={`/users/${comment.user_id}`}
                                          className={`${inter.className} text-md text-link hover:text-link-hover truncate font-semibold transition-colors duration-200 hover:underline`}
                                        >
                                          {userData[comment.user_id]?.username || comment.author}
                                        </Link>
                                      </Tooltip>

                                      {/* User Badges */}
                                      {!hideRecent && userData[comment.user_id] && (
                                        <UserBadges
                                          usernumber={userData[comment.user_id].usernumber}
                                          premiumType={premiumType}
                                          flags={flags}
                                          size="md"
                                        />
                                      )}
                                    </div>

                                    {/* Trade OP Badge */}
                                    {type === 'trade' &&
                                      trade &&
                                      comment.user_id === trade.author && (
                                        <span className="from-button-info to-button-info-hover text-card-tag-text rounded-full bg-gradient-to-r px-2 py-0.5 text-xs font-medium shadow-sm">
                                          OP
                                        </span>
                                      )}
                                  </>
                                )}
                              </div>

                              <CommentTimestamp
                                date={comment.date}
                                editedAt={comment.edited_at}
                                commentId={comment.id}
                              />
                            </div>
                          </div>

                          {/* Enhanced Action Menu */}
                          <div className="flex items-center gap-2">
                            <IconButton
                              size="small"
                              onClick={(e) => handleMenuOpen(e, comment.id)}
                              className={`text-primary-text hover:bg-quaternary-bg rounded-lg p-2 opacity-0 transition-all duration-200 group-hover:opacity-100 ${Boolean(menuAnchorEl) && selectedCommentId === comment.id ? 'opacity-100' : ''}`}
                            >
                              <EllipsisHorizontalIcon className="h-4 w-4" />
                            </IconButton>
                          </div>
                        </div>

                        {/* Content Section */}
                        <div>
                          {editingCommentId === comment.id ? (
                            <div className="space-y-3">
                              <TextField
                                fullWidth
                                multiline
                                minRows={3}
                                maxRows={10}
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                variant="outlined"
                                size="small"
                                error={
                                  editContent.length >
                                  getCharLimit(
                                    currentUserPremiumType as keyof typeof COMMENT_CHAR_LIMITS,
                                  )
                                }
                                helperText={' '}
                                slotProps={{
                                  input: {
                                    autoCorrect: 'off',
                                    autoComplete: 'off',
                                    spellCheck: 'false',
                                    autoCapitalize: 'off',
                                    className: '[&_textarea]:resize-y',
                                  },
                                }}
                                className="[&_.MuiFormHelperText-root]:text-secondary-text [&_.MuiFormHelperText-root.Mui-disabled]:text-secondary-text [&_.MuiFormHelperText-root.Mui-error]:text-button-danger [&_.MuiInputBase-root]:bg-form-input [&_.MuiInputBase-root.Mui-disabled]:bg-primary-bg [&_.MuiInputBase-root.Mui-disabled_.MuiOutlinedInput-notchedOutline]:border-secondary-bg [&_.MuiInputBase-root.Mui-disabled_.MuiInputBase-input]:text-secondary-text [&_.MuiInputBase-input]:text-primary-text [&_.MuiInputBase-input::placeholder]:text-secondary-text [&_.MuiOutlinedInput-notchedOutline]:border-stroke [&_.MuiInputBase-root:hover_.MuiOutlinedInput-notchedOutline]:border-button-info [&_.MuiInputBase-root.Mui-focused_.MuiOutlinedInput-notchedOutline]:border-button-info"
                              />
                              <div className="flex gap-2">
                                <Button
                                  size="small"
                                  variant="contained"
                                  onClick={() => handleEditComment(comment.id)}
                                  disabled={!editContent.trim()}
                                  className="bg-button-info text-form-button-text hover:bg-button-info-hover rounded-md text-sm normal-case"
                                >
                                  Update
                                </Button>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={() => {
                                    setEditingCommentId(null);
                                    setEditContent('');
                                  }}
                                  className="text-secondary-text hover:text-primary-text rounded-md border-none bg-transparent text-sm normal-case"
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div>
                              {loadingUserData[comment.user_id] ? (
                                <div className="space-y-2">
                                  <div className="bg-primary-bg h-5 w-full animate-pulse rounded" />
                                  <div className="bg-primary-bg h-5 w-[90%] animate-pulse rounded" />
                                  <div className="bg-primary-bg h-5 w-[80%] animate-pulse rounded" />
                                </div>
                              ) : (
                                <>
                                  <div className="prose prose-sm max-w-none">
                                    {(() => {
                                      const MAX_VISIBLE_LINES = 5;
                                      const MAX_VISIBLE_CHARS = 150;
                                      const lines = comment.content.split(/\r?\n/);
                                      const isLongLine = comment.content.length > MAX_VISIBLE_CHARS;
                                      const shouldTruncate =
                                        lines.length > MAX_VISIBLE_LINES || isLongLine;
                                      const isExpanded = expandedComments.has(comment.id);

                                      let visibleContent: string;
                                      if (shouldTruncate && !isExpanded) {
                                        if (lines.length > MAX_VISIBLE_LINES) {
                                          visibleContent = lines
                                            .slice(0, MAX_VISIBLE_LINES)
                                            .join('\n');
                                        } else {
                                          visibleContent =
                                            comment.content.slice(0, MAX_VISIBLE_CHARS) + '...';
                                        }
                                      } else {
                                        visibleContent = comment.content;
                                      }

                                      return (
                                        <>
                                          <p className="text-primary-text text-sm leading-relaxed break-words whitespace-pre-wrap">
                                            {convertUrlsToLinks(visibleContent)}
                                          </p>
                                          {shouldTruncate && (
                                            <button
                                              onClick={() => toggleCommentExpand(comment.id)}
                                              className="text-link hover:text-link-hover mt-2 flex items-center gap-1 text-sm font-medium transition-colors duration-200 hover:underline"
                                            >
                                              {isExpanded ? (
                                                <>
                                                  <FaChevronUp className="h-4 w-4" />
                                                  Show less
                                                </>
                                              ) : (
                                                <>
                                                  <FaChevronDown className="h-4 w-4" />
                                                  Read more
                                                </>
                                              )}
                                            </button>
                                          )}
                                        </>
                                      );
                                    })()}
                                  </div>
                                </>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Enhanced Menu */}
                        <Menu
                          anchorEl={menuAnchorEl}
                          open={Boolean(menuAnchorEl) && selectedCommentId === comment.id}
                          onClose={handleMenuClose}
                        >
                          {currentUserId === comment.user_id ? (
                            [
                              // Only show edit option if comment is within 1 hour of creation
                              isCommentEditable(comment.date) && (
                                <MenuItem key="edit" onClick={handleEditClick}>
                                  <PencilIcon className="mr-3 h-4 w-4" />
                                  Edit Comment
                                </MenuItem>
                              ),
                              <MenuItem
                                key="delete"
                                onClick={handleDeleteClick}
                                className="text-button-danger hover:bg-button-danger/10"
                              >
                                <TrashIcon className="text-button-danger mr-3 h-4 w-4" />
                                Delete Comment
                              </MenuItem>,
                            ].filter(Boolean)
                          ) : (
                            <MenuItem onClick={handleReportClick}>
                              <FlagIcon className="mr-3 h-4 w-4" />
                              Report Comment
                            </MenuItem>
                          )}
                        </Menu>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Pagination controls */}
              {filteredComments.length > commentsPerPage && (
                <div className="mt-4 flex justify-center sm:mt-6">
                  <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={handlePageChange}
                    sx={{
                      '& .MuiPaginationItem-root': {
                        color: 'var(--color-primary-text)',
                        '&.Mui-selected': {
                          backgroundColor: 'var(--color-button-info)',
                          color: 'var(--color-form-button-text)',
                          '&:hover': {
                            backgroundColor: 'var(--color-button-info-hover)',
                          },
                        },
                        '&:hover': {
                          backgroundColor: 'var(--color-quaternary-bg)',
                        },
                      },
                      '& .MuiPaginationItem-icon': {
                        color: 'var(--color-primary-text)',
                      },
                    }}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Replace the old Dialog with the new ReportCommentModal */}
      <ReportCommentModal
        open={reportModalOpen}
        onClose={() => {
          setReportModalOpen(false);
          setReportReason('');
          setReportingCommentId(null);
        }}
        onSubmit={handleReportSubmit}
        reportReason={reportReason}
        setReportReason={setReportReason}
        commentContent={
          reportingCommentId
            ? filteredComments.find((c) => c.id === reportingCommentId)?.content || ''
            : ''
        }
        commentOwner={
          reportingCommentId
            ? userData[filteredComments.find((c) => c.id === reportingCommentId)?.user_id || '']
                ?.settings?.show_recent_comments === 0 &&
              currentUserId !== filteredComments.find((c) => c.id === reportingCommentId)?.user_id
              ? 'Hidden User'
              : userData[filteredComments.find((c) => c.id === reportingCommentId)?.user_id || '']
                  ?.username || 'Unknown User'
            : ''
        }
        commentId={reportingCommentId || 0}
      />

      <LoginModalWrapper open={loginModalOpen} onClose={() => setLoginModalOpen(false)} />

      {/* Supporter Modal */}
      <SupporterModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        feature={modalState.feature}
        currentTier={modalState.currentTier}
        requiredTier={modalState.requiredTier}
        currentLimit={modalState.currentLimit}
        requiredLimit={modalState.requiredLimit}
      />

      {/* Post Success Snackbar */}
      <Snackbar
        open={postSnackbarOpen}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        onClose={() => setPostSnackbarOpen(false)}
        autoHideDuration={5000}
      >
        <MuiAlert
          elevation={6}
          variant="filled"
          severity="success"
          className="bg-secondary-bg text-primary-text border-border-focus border font-medium"
        >
          {postSnackbarMsg}
        </MuiAlert>
      </Snackbar>

      {/* Post Error Snackbar */}
      <Snackbar
        open={postErrorSnackbarOpen}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        onClose={() => setPostErrorSnackbarOpen(false)}
        autoHideDuration={6000}
      >
        <MuiAlert
          elevation={6}
          variant="filled"
          severity="error"
          className="bg-secondary-bg text-primary-text border-border-error border font-medium"
        >
          {postErrorSnackbarMsg}
        </MuiAlert>
      </Snackbar>

      {/* Edit Success Snackbar */}
      <Snackbar
        open={editSnackbarOpen}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        onClose={() => setEditSnackbarOpen(false)}
        autoHideDuration={5000}
      >
        <MuiAlert
          elevation={6}
          variant="filled"
          severity="success"
          className="bg-secondary-bg text-primary-text border-border-focus border font-medium"
        >
          {editSnackbarMsg}
        </MuiAlert>
      </Snackbar>

      {/* Global Error Snackbar */}
      <Snackbar
        open={globalErrorSnackbarOpen}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        onClose={() => setGlobalErrorSnackbarOpen(false)}
        autoHideDuration={6000}
      >
        <MuiAlert
          elevation={6}
          variant="filled"
          severity="error"
          className="bg-secondary-bg text-primary-text border-border-error border font-medium"
        >
          {globalErrorSnackbarMsg}
        </MuiAlert>
      </Snackbar>

      {/* Info Snackbar (for report received) */}
      <Snackbar
        open={infoSnackbarOpen}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        onClose={() => setInfoSnackbarOpen(false)}
        autoHideDuration={5000}
      >
        <MuiAlert
          elevation={6}
          variant="filled"
          severity="info"
          className="bg-secondary-bg text-primary-text border-border-focus border font-medium"
        >
          {infoSnackbarMsg}
        </MuiAlert>
      </Snackbar>
    </div>
  );
};

export default ChangelogComments;
