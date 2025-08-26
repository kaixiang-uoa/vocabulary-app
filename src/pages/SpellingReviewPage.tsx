import React, { useState, useMemo, useEffect } from "react";
import { useParams, Link } from "react-router";
import {
  Button,
  Text,
  Title,
  RadioGroup,
  RadioButton,
  Empty,
  message,
  Switch,
  InputNumber,
  Space,
} from "../components/ui";
import {
  ArrowLeftIcon,
  ArrowPathIcon,
  SpeakerWaveIcon,
} from "@heroicons/react/24/outline";
import SpellingReviewCard from "../components/SpellingReviewCard";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { useWordContext } from "../contexts/WordContext";
import { useTranslation } from "react-i18next";
import { getTailwindClass } from "../utils/styleMapping";
import { useReviewData, useReviewNavigation } from "../hooks";
import { playPronunciation } from "../services/pronunciationService";

type ReviewMode = "all" | "unmastered" | "mastered";
type ReviewOrder = "sequential" | "random";

const SpellingReviewPage: React.FC = () => {
  const { t } = useTranslation();
  const { unitId } = useParams<{ unitId: string }>();
  const [reviewMode, setReviewMode] = useState<ReviewMode>("all");
  const [reviewOrder, setReviewOrder] = useState<ReviewOrder>("sequential");

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Auto play state - default enabled
  const [autoPlay, setAutoPlay] = useState(true);
  const [pronunciationDelay, setPronunciationDelay] = useState(1);

  // Data layer
  const { data, loading, error } = useReviewData({
    unitId: unitId!,
    reviewMode,
    reviewOrder,
    refreshTrigger,
  });

  // Calculate word counts for each mode - use real-time data
  const wordCounts = useMemo(() => {
    if (!data.unit) return { all: 0, mastered: 0, unmastered: 0 };

    // Use data from the hook instead of real-time fetch
    const allWords = data.unit.words;

    return {
      all: allWords.length,
      mastered: allWords.filter((word) => word.mastered).length,
      unmastered: allWords.filter((word) => !word.mastered).length,
    };
  }, [data.unit]);

  // Auto-switch mode if current mode has no words
  useEffect(() => {
    if (data.unit && wordCounts[reviewMode] === 0) {
      // Find a mode with words
      if (wordCounts.all > 0) {
        setReviewMode("all");
        message.info(t("switched_to_all_mode"));
      } else if (wordCounts.unmastered > 0) {
        setReviewMode("unmastered");
        message.info(t("switched_to_unmastered_mode"));
      } else if (wordCounts.mastered > 0) {
        setReviewMode("mastered");
        message.info(t("switched_to_mastered_mode"));
      }
    }
  }, [data.unit, reviewMode, wordCounts, t]);

  // Navigation layer
  const {
    currentWord,
    currentIndex,
    isFirst,
    isLast,
    progress,
    nextWord,
    prevWord,
    restart,
    completedWords,
    failedWords,
    markCompleted,
    markFailed,
  } = useReviewNavigation({ words: data.words });

  // Simple audio play function
  const handlePlayPronunciation = (word: string) => {
    playPronunciation(word);
  };

  // Use word operations from global context for mastered status
  const { setWordMasteredStatusDirect, loadData: loadOpsData } = useWordContext();

  // Ensure operations hook has data loaded to avoid early returns
  useEffect(() => {
    if (unitId) {
      loadOpsData();
    }
  }, [unitId, loadOpsData]);

  // Set mastered state for spelling review
  const handleSetMasteredStatus = async (wordId: string, mastered: boolean) => {
    if (!unitId) return;

    const success = await setWordMasteredStatusDirect(unitId, wordId, mastered);
    if (success) {
      message.success(t("status_updated"));
      // Trigger refresh to update word counts
      setRefreshTrigger((prev) => prev + 1);
    } else {
      message.error(t("status_update_failed"));
    }
  };

  // Next/prev handlers
  const handleNext = () => {
    if (!isLast) {
      nextWord();
    }
    // Review completed - SpellingReviewCard handles navigation to Unit Details
  };

  const handlePrev = () => {
    if (!isFirst) {
      prevWord();
    }
  };

  const handleRestart = () => {
    restart();
    message.info(t("review_restart"));
  };

  const handleModeChange = (e: any) => {
    setReviewMode(e.target.value);
  };

  const handleOrderChange = (e: any) => {
    setReviewOrder(e.target.value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-lg text-gray-600">
        {t("loading")}
      </div>
    );
  }

  if (error || !data.unit) {
    return (
      <div className="flex items-center justify-center h-64 text-lg text-gray-600">
        {error || t("unit_not_found")}
      </div>
    );
  }

  if (data.words.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Empty description={t("no_words_to_review", { mode: reviewMode })} />
      </div>
    );
  }

  return (
    <div className={getTailwindClass("spelling-review-page")}>
      {/* First row: Title and language switcher */}
      <div className={getTailwindClass("page-header")}>
        <Title level={2} className={getTailwindClass("page-title")}>
          {data.unit.name} - {t("spelling_review_title")}
        </Title>
        <LanguageSwitcher className="flex items-center gap-2" />
      </div>

      {/* Second row: Action controls */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 mb-6">
        {/* All controls in one flex container with wrap */}
        <div className="flex flex-wrap items-start justify-between gap-6">
          {/* Navigation controls */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <Link to={`/unit/${unitId}`}>
              <Button
                className={`${getTailwindClass("btn-secondary")} ${getTailwindClass("btn-standard")} font-bold`}
                icon={<ArrowLeftIcon className="w-4 h-4" />}
              >
                {t("back_to_unit")}
              </Button>
            </Link>
            <Button
              icon={<ArrowPathIcon className="w-4 h-4" />}
              onClick={handleRestart}
              disabled={isFirst}
              className={`${getTailwindClass("btn-primary")} ${getTailwindClass("btn-standard")}`}
              title={isFirst ? t("restart_disabled_tip") : t("restart_tip")}
            >
              {t("restart")}
            </Button>
          </div>

          {/* Review controls - unified layout */}
          <div className="flex flex-wrap items-start gap-6">
            {/* Review mode controls */}
            <div className="flex flex-col gap-3 flex-shrink-0 min-w-[140px]">
              <label className="text-sm font-bold text-gray-700">
                {t("review_mode")}
              </label>
              <RadioGroup
                value={reviewMode}
                onChange={handleModeChange}
                className="flex gap-2"
              >
                <RadioButton value="all" disabled={wordCounts.all === 0}>
                  {t("all")} ({wordCounts.all})
                </RadioButton>
                <RadioButton
                  value="unmastered"
                  disabled={wordCounts.unmastered === 0}
                >
                  {t("unmastered")} ({wordCounts.unmastered})
                </RadioButton>
                <RadioButton
                  value="mastered"
                  disabled={wordCounts.mastered === 0}
                >
                  {t("mastered")} ({wordCounts.mastered})
                </RadioButton>
              </RadioGroup>
            </div>

            {/* Review order controls */}
            <div className="flex flex-col gap-3 flex-shrink-0 min-w-[140px]">
              <label className="text-sm font-bold text-gray-700">
                {t("review_order")}
              </label>
              <RadioGroup
                value={reviewOrder}
                onChange={handleOrderChange}
                className="flex gap-2"
              >
                <RadioButton value="sequential">{t("sequential")}</RadioButton>
                <RadioButton value="random">{t("random")}</RadioButton>
              </RadioGroup>
            </div>
          </div>
        </div>
      </div>

      {/* Auto play controls - Responsive Layout */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        {/* Large screen: horizontal layout */}
        <div className="hidden lg:flex items-center gap-3">
          <div className="flex items-center gap-2">
            <SpeakerWaveIcon className="w-5 h-5 text-gray-600" />
            <Text className="text-base font-medium text-gray-700">
              {t("auto_play_pronunciation")}:
            </Text>
            <Switch checked={autoPlay} onChange={setAutoPlay} size="small" />
            <Text
              className={`text-sm ${autoPlay ? "text-green-600 font-medium" : "text-gray-500"}`}
            >
              {autoPlay ? t("auto_play_enabled") : t("auto_play_disabled")}
            </Text>
          </div>

          {autoPlay && (
            <div className="flex items-center gap-1">
              <Text className="text-sm text-gray-600">
                {t("pronunciation_delay")}:
              </Text>
              <InputNumber
                min={0}
                max={10}
                step={1}
                precision={0}
                value={pronunciationDelay}
                onChange={(value) => setPronunciationDelay(value ?? 1)}
                size="small"
                className="w-12"
                title={t("pronunciation_delay_tip")}
              />
              <Text className="text-sm text-gray-600">s</Text>
            </div>
          )}

          {currentWord && (
            <Button
              type="default"
              icon={<SpeakerWaveIcon />}
              onClick={() => handlePlayPronunciation(currentWord.word)}
              size="small"
              className={`${getTailwindClass("btn-primary")} ${getTailwindClass("btn-standard")}`}
            >
              {t("play_pronunciation")}
            </Button>
          )}
        </div>

        {/* Small and medium screens: vertical layout */}
        <div className="lg:hidden space-y-4">
          {/* First row: Auto play toggle */}
          <div className="flex items-center gap-2">
            <SpeakerWaveIcon className="w-5 h-5 text-gray-600" />
            <Text className="text-base font-medium text-gray-700">
              {t("auto_play_pronunciation")}:
            </Text>
            <Switch checked={autoPlay} onChange={setAutoPlay} size="small" />
            <Text
              className={`text-sm ${autoPlay ? "text-green-600 font-medium" : "text-gray-500"}`}
            >
              {autoPlay ? t("auto_play_enabled") : t("auto_play_disabled")}
            </Text>
          </div>

          {/* Second row: Delay, Repeat Count (future), and Play button */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {autoPlay && (
                <div className="flex items-center gap-2">
                  <Text className="text-sm text-gray-600">
                    {t("pronunciation_delay")}:
                  </Text>
                  <InputNumber
                    min={0}
                    max={10}
                    step={1}
                    precision={0}
                    value={pronunciationDelay}
                    onChange={(value) => setPronunciationDelay(value ?? 1)}
                    size="small"
                    className="w-16"
                    title={t("pronunciation_delay_tip")}
                  />
                  <Text className="text-sm text-gray-600">s</Text>
                </div>
              )}

              {/* Future: Repeat Count Control */}
              {/* <div className="flex items-center gap-2">
                <Text className="text-sm text-gray-600">
                  {t('repeat_count')}:
                </Text>
                <InputNumber
                  min={1}
                  max={5}
                  step={1}
                  precision={0}
                  value={repeatCount}
                  onChange={(value) => setRepeatCount(value ?? 1)}
                  size="small"
                  className="w-16"
                  title={t('repeat_count_tip')}
                />
                <Text className="text-sm text-gray-600">{t('times')}</Text>
              </div> */}
            </div>

            {currentWord && (
              <Button
                type="default"
                icon={<SpeakerWaveIcon />}
                onClick={() => handlePlayPronunciation(currentWord.word)}
                size="small"
                className={`${getTailwindClass("btn-primary")} ${getTailwindClass("btn-standard")} flex-1 max-w-[200px]`}
              >
                {t("play_pronunciation")}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Game rules explanation */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <Text className="text-base text-blue-800">
          💡 {t("spelling_rules")}
        </Text>
      </div>

      {data.words.length > 0 ? (
        <div>
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-base font-semibold text-gray-700">
                {t("learning_progress")}
              </span>
              <span className="text-lg font-bold text-blue-600">
                {currentIndex + 1}/{data.words.length}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="flex justify-center mb-8">
            <div className="w-full max-w-2xl">
              {currentWord ? (
                <SpellingReviewCard
                  key={currentWord.id || currentIndex}
                  word={currentWord}
                  onMasteredToggle={(mastered) =>
                    handleSetMasteredStatus(currentWord.id, mastered)
                  }
                  onNext={handleNext}
                  onPrev={handlePrev}
                  isFirst={isFirst}
                  isLast={isLast}
                  currentIndex={currentIndex}
                  failedWords={failedWords}
                  setFailedWords={markFailed}
                  onCompleted={markCompleted}
                  autoPlay={autoPlay}
                  pronunciationDelay={pronunciationDelay}
                />
              ) : (
                <div className="text-center text-gray-500">
                  {t("loading_word")}
                </div>
              )}
            </div>
          </div>

          {/* Statistics */}
          <div className="flex justify-center mb-6">
            <Space
              size="large"
              className="bg-gray-50 p-4 rounded-lg border border-gray-200"
            >
              <div className="flex items-center gap-2">
                <Text strong className="text-base text-gray-700">
                  {t("completed")}:{" "}
                </Text>
                <Text className="text-lg font-semibold text-green-600">
                  {completedWords.size}
                </Text>
              </div>
              <div className="flex items-center gap-2">
                <Text strong className="text-base text-gray-700">
                  {t("failed")}:{" "}
                </Text>
                <Text className="text-lg font-semibold text-red-600">
                  {failedWords.size}
                </Text>
              </div>
              <div className="flex items-center gap-2">
                <Text strong className="text-base text-gray-700">
                  {t("remaining")}:{" "}
                </Text>
                <Text className="text-lg font-semibold text-gray-600">
                  {data.words.length - currentIndex - 1}
                </Text>
              </div>
            </Space>
          </div>
        </div>
      ) : (
        <Empty
          description={
            <span>
              {t("no_words", {
                mode:
                  reviewMode === "unmastered"
                    ? t("unmastered")
                    : reviewMode === "mastered"
                      ? t("mastered")
                      : t("all"),
              })}
            </span>
          }
        />
      )}
    </div>
  );
};

export default SpellingReviewPage;
