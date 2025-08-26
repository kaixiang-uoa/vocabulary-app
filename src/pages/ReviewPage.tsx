import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import {
  Button,
  Progress,
  Text,
  Title,
  RadioGroup,
  RadioButton,
  Empty,
  message,
} from "../components/ui";
import { ArrowLeftIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import ReviewWordCard from "../components/ReviewWordCard";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { useTranslation } from "react-i18next";

import { getTailwindClass } from "../utils/styleMapping";
import { useWordContext } from "../contexts/WordContext";

type ReviewMode = "all" | "unmastered" | "mastered";
type ReviewOrder = "sequential" | "random";

const ReviewPage: React.FC = () => {
  const { t } = useTranslation();
  const { unitId } = useParams<{ unitId: string }>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reviewMode, setReviewMode] = useState<ReviewMode>("all");
  const [reviewOrder, setReviewOrder] = useState<ReviewOrder>("sequential");
  const [isFlipped, setIsFlipped] = useState(false);
  const [flipMode, setFlipMode] = useState<"en2zh" | "zh2en">("en2zh");

  // Use global word context
  const { data, loadData, toggleWordMasteredStatus } = useWordContext();

  // Get current unit and words from hook data
  const unit = data?.units.find((u) => u.id === unitId) || null;

  // Filter and sort words based on review mode and order
  const words = React.useMemo(() => {
    const allWords = unit?.words || [];
    let filteredWords = [...allWords];

    if (reviewMode === "unmastered") {
      filteredWords = filteredWords.filter((word) => !word.mastered);
    } else if (reviewMode === "mastered") {
      filteredWords = filteredWords.filter((word) => word.mastered);
    }

    if (reviewOrder === "random") {
      filteredWords = [...filteredWords].sort(() => Math.random() - 0.5);
    }

    return filteredWords;
  }, [unit?.words, reviewMode, reviewOrder]);

  // Load data when component mounts or unitId changes
  useEffect(() => {
    if (unitId) {
      loadData();
    }
  }, [unitId, loadData]);

  // Reset current index when words change
  useEffect(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [words]);

  // Toggle mastered state
  const handleMasteredToggle = async (wordId: string) => {
    if (!unitId) return;

    const success = await toggleWordMasteredStatus(unitId, wordId);
    if (success) {
      message.success(t("status_updated"));
    } else {
      message.error(t("status_update_failed"));
    }
  };

  // Next/prev/restart handlers
  const handleNext = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    } else {
      message.success(t("review_complete"));
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    message.info(t("review_restart"));
  };

  const handleModeChange = (e: any) => {
    const value = e.target?.value || e;
    setReviewMode(value);
  };

  const handleOrderChange = (e: any) => {
    const value = e.target?.value || e;
    setReviewOrder(value);
  };

  const handleFlipModeChange = (e: any) => {
    const value = e.target?.value || e;
    setFlipMode(value);
  };

  if (!unit) {
    return (
      <div className="flex items-center justify-center h-64 text-lg text-gray-600">
        {t("loading")}
      </div>
    );
  }

  // Calculate progress
  const progress =
    words.length > 0
      ? Math.round(((currentIndex + 1) / words.length) * 100)
      : 0;

  return (
    <div className={getTailwindClass("review-page")}>
      {/* First row: Title and language switcher */}
      <div className={getTailwindClass("page-header")}>
        <Title level={2} className={getTailwindClass("page-title")}>
          {unit.name} - {t("word_review")}
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
              className={`${getTailwindClass("btn-primary")} ${getTailwindClass("btn-standard")}`}
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
                <RadioButton value="all">{t("all")}</RadioButton>
                <RadioButton value="unmastered">{t("unmastered")}</RadioButton>
                <RadioButton value="mastered">{t("mastered")}</RadioButton>
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

            {/* Flip mode controls */}
            <div className="flex flex-col gap-3 flex-shrink-0 min-w-[140px]">
              <label className="text-sm font-bold text-gray-700">
                {t("flip_mode")}
              </label>
              <RadioGroup
                value={flipMode}
                onChange={handleFlipModeChange}
                className="flex gap-2"
              >
                <RadioButton value="en2zh">{t("flip_mode_en2zh")}</RadioButton>
                <RadioButton value="zh2en">{t("flip_mode_zh2en")}</RadioButton>
              </RadioGroup>
            </div>
          </div>
        </div>
      </div>
      {words.length > 0 ? (
        <div>
          <div className="mb-6">
            <Progress
              percent={progress}
              status="active"
              format={() => `${currentIndex + 1}/${words.length}`}
              className={getTailwindClass("progress-text")}
            />
          </div>
          <div className="flex justify-center mb-8">
            <div className="w-full max-w-2xl">
              <ReviewWordCard
                key={words[currentIndex]?.id || currentIndex}
                word={words[currentIndex]}
                isFlipped={isFlipped}
                onFlip={() => setIsFlipped((f) => !f)}
                onMasteredToggle={() =>
                  handleMasteredToggle(words[currentIndex].id)
                }
                flipMode={flipMode}
              />
            </div>
          </div>
          <div className="flex justify-center gap-4 mb-4">
            <Button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className={`${getTailwindClass("btn-primary")} ${getTailwindClass("btn-standard")} ${currentIndex === 0 ? "opacity-50" : ""}`}
            >
              {t("prev")}
            </Button>
            <Button
              onClick={handleNext}
              className={`${getTailwindClass("btn-primary")} ${getTailwindClass("btn-standard")} ${currentIndex === words.length - 1 ? "opacity-50" : ""}`}
              disabled={currentIndex === words.length - 1}
            >
              {t("next")}
            </Button>
          </div>
          <div className="text-center mt-4">
            <Text
              className={`${getTailwindClass("text-secondary")} text-lg font-medium`}
            >
              {t("flip_card_tip", {
                side: words[currentIndex].mastered ? t("word") : t("meaning"),
              })}
            </Text>
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

export default ReviewPage;
