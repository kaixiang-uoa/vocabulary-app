import React, { useState, useEffect } from "react";
import {
  Button,
  Input,
  Checkbox,
  Popconfirm,
  Modal,
  message,
} from "./ui";
import { useTranslation } from "react-i18next";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  ArrowUpTrayIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";
import UnitCard from "./UnitCard";
import ImportModal from "./ImportModal";

import { ImportData } from "../types/index";
import { useWordContext } from "../contexts/WordContext";
// Loading is handled globally via WordContext/HomePage

const UnitList: React.FC = () => {
  const { t } = useTranslation();
  const [selectedUnits, setSelectedUnits] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(6);
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isImportModalVisible, setIsImportModalVisible] = useState(false);
  const [helpVisible, setHelpVisible] = useState(false);
  const [newUnitName, setNewUnitName] = useState("");

  // Use word operations hook
  const { data, createNewUnit, updateUnitData, deleteUnits, batchImportData } = useWordContext();

  // Progressive loading is centralized; UnitList renders based on provided data

  // Filter units based on search term
  const filteredUnits = React.useMemo(() => {
    const units = data?.units || [];
    return units.filter((unit) =>
      unit.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [data?.units, searchTerm]);

  // Data is loaded by WordContext; no local fetching here

  // Reset to first page when searching
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const showCreateModal = () => {
    setNewUnitName("");
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setNewUnitName("");
  };

  const handleCreate = async () => {
    const trimmedName = newUnitName.trim();
    if (!trimmedName) {
      message.error(t("unit_name_required"));
      return;
    }

    // Check for duplicate unit names
    const units = data?.units || [];
    const existingUnit = units.find(
      (unit) => unit.name.toLowerCase() === trimmedName.toLowerCase(),
    );
    if (existingUnit) {
      message.error(t("unit_name_exists"));
      return;
    }

    try {
      const unitId = await createNewUnit(trimmedName);
      if (unitId) {
        setIsModalVisible(false);
        setNewUnitName("");
        message.success(t("unit_created_success"));
      } else {
        message.error(t("unit_created_error"));
      }
    } catch (error) {
      message.error(t("unit_created_error"));
    }
  };

  const handleSelectUnit = (unitId: string) => {
    setSelectedUnits((prev) =>
      prev.includes(unitId)
        ? prev.filter((id) => id !== unitId)
        : [...prev, unitId],
    );
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUnits(paginatedUnits.map((unit) => unit.id));
    } else {
      setSelectedUnits([]);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedUnits.length === 0) return;

    const success = await deleteUnits(selectedUnits);
    if (success) {
      setSelectedUnits([]);
      message.success(t("delete_success", { count: selectedUnits.length }));
    } else {
      message.error(t("delete_fail"));
    }
  };

  const handleExportAll = async () => {
    try {
      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `vocabulary-backup-${new Date().toISOString().slice(0, 10)}.json`,
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      message.success(t("export_success"));
    } catch (error) {
      message.error(t("export_error"));
    }
  };

  const handleImportAll = () => {
    setIsImportModalVisible(true);
  };

  const handleImportConfirm = async (parsed: ImportData) => {
    try {
      const result = await batchImportData(parsed);
      
      if (result.success) {
        setIsImportModalVisible(false);
        message.success(t("import_batch_success", { count: result.count }));
      } else {
        message.error(t("import_fail"));
      }
    } catch (error) {
      console.error("Import failed:", error);
      message.error(t("import_fail"));
    }
  };

  const handleEditUnit = async (unitId: string, values: { name: string }) => {
    const success = await updateUnitData(unitId, values);
    if (success) {
      message.success(t("unit_updated"));
    } else {
      message.error(t("unit_update_failed"));
    }
  };

  // Pagination
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedUnits = filteredUnits.slice(startIndex, endIndex);

  // Select all/indeterminate state
  const isAllSelected =
    paginatedUnits.length > 0 && selectedUnits.length === paginatedUnits.length;
  const isIndeterminate =
    selectedUnits.length > 0 && selectedUnits.length < paginatedUnits.length;

  return (
    <div>
      {/* Search and action buttons - responsive layout */}
      <div className="mb-6">
        {/* Large screens: horizontal layout */}
        <div className="hidden lg:flex items-center gap-6 mb-4">
          <div className="w-80">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
              <Input
                placeholder={t("search_unit_placeholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 text-base"
                allowClear
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              icon={<QuestionMarkCircleIcon />}
              onClick={() => setHelpVisible(true)}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold transition-all duration-200 rounded-lg px-4 py-2 text-base shadow-md hover:shadow-lg hover:transform hover:-translate-y-0.5"
            >
              {t("help")}
            </Button>
            <Button
              icon={<PlusIcon />}
              onClick={showCreateModal}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold transition-all duration-200 rounded-lg px-4 py-2 text-base shadow-md hover:shadow-lg hover:transform hover:-translate-y-0.5"
            >
              {t("create_unit")}
            </Button>
            <Button
              icon={<ArrowUpTrayIcon />}
              onClick={handleExportAll}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold transition-all duration-200 rounded-lg px-4 py-2 text-base shadow-md hover:shadow-lg hover:transform hover:-translate-y-0.5"
            >
              {t("export_all")}
            </Button>
            <Button
              icon={<ArrowUpTrayIcon />}
              onClick={handleImportAll}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold transition-all duration-200 rounded-lg px-4 py-2 text-base shadow-md hover:shadow-lg hover:transform hover:-translate-y-0.5"
            >
              {t("import_all")}
            </Button>
          </div>
        </div>

        {/* Medium screens: vertical layout */}
        <div className="hidden md:block lg:hidden space-y-4">
          <div className="relative max-w-full">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
            <Input
              placeholder={t("search_unit_placeholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 text-base"
              allowClear
            />
          </div>

          <div className="flex justify-center gap-2">
            <Button
              icon={<QuestionMarkCircleIcon />}
              onClick={() => setHelpVisible(true)}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold transition-all duration-200 rounded-lg px-4 py-2 text-base shadow-md hover:shadow-lg hover:transform hover:-translate-y-0.5"
            >
              {t("help")}
            </Button>
            <Button
              icon={<PlusIcon />}
              onClick={showCreateModal}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold transition-all duration-200 rounded-lg px-4 py-2 text-base shadow-md hover:shadow-lg hover:transform hover:-translate-y-0.5"
            >
              {t("create_unit")}
            </Button>
            <Button
              icon={<ArrowUpTrayIcon />}
              onClick={handleExportAll}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold transition-all duration-200 rounded-lg px-4 py-2 text-base shadow-md hover:shadow-lg hover:transform hover:-translate-y-0.5"
            >
              {t("export_all")}
            </Button>
            <Button
              icon={<ArrowUpTrayIcon />}
              onClick={handleImportAll}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold transition-all duration-200 rounded-lg px-4 py-2 text-base shadow-md hover:shadow-lg hover:transform hover:-translate-y-0.5"
            >
              {t("import_all")}
            </Button>
          </div>
        </div>

        {/* Small screens: mobile layout */}
        <div className="block md:hidden space-y-4 px-4">
          <div className="relative max-w-full">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
            <Input
              placeholder={t("search_unit_placeholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 text-base"
              allowClear
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              icon={<QuestionMarkCircleIcon />}
              onClick={() => setHelpVisible(true)}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold transition-all duration-200 rounded-lg px-3 py-2 text-sm shadow-md hover:shadow-lg hover:transform hover:-translate-y-0.5"
            >
              {t("help")}
            </Button>
            <Button
              icon={<PlusIcon />}
              onClick={showCreateModal}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold transition-all duration-200 rounded-lg px-3 py-2 text-sm shadow-md hover:shadow-lg hover:transform hover:-translate-y-0.5"
            >
              {t("create_unit")}
            </Button>
            <Button
              icon={<ArrowUpTrayIcon />}
              onClick={handleExportAll}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold transition-all duration-200 rounded-lg px-3 py-2 text-sm shadow-md hover:shadow-lg hover:transform hover:-translate-y-0.5"
            >
              {t("export_all")}
            </Button>
            <Button
              icon={<ArrowUpTrayIcon />}
              onClick={handleImportAll}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold transition-all duration-200 rounded-lg px-3 py-2 text-sm shadow-md hover:shadow-lg hover:transform hover:-translate-y-0.5"
            >
              {t("import_all")}
            </Button>
          </div>
        </div>
      </div>

      {/* Selection and pagination controls */}
      {filteredUnits.length > 0 && (
        <>
          {/* Large screens: horizontal layout */}
          <div className="hidden lg:flex items-center justify-between mb-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
            {/* Left side: Selection controls */}
            <div className="flex items-center gap-3">
              <Checkbox
                checked={isAllSelected}
                indeterminate={isIndeterminate}
                onChange={handleSelectAll}
                className="text-sm font-medium"
              >
                {t("select_all")}
              </Checkbox>
              <Popconfirm
                title={t("delete_confirm_title")}
                description={t("delete_confirm_desc")}
                onConfirm={handleDeleteSelected}
                okText={t("ok")}
                cancelText={t("cancel")}
                trigger="click"
              >
                <Button
                  type="primary"
                  danger
                  disabled={selectedUnits.length === 0}
                  className={`font-medium text-sm transition-all duration-200 ${
                    selectedUnits.length === 0
                      ? "bg-gray-100 text-gray-400 border-gray-200 opacity-50"
                      : "bg-white text-red-600 border-red-600 hover:bg-red-50"
                  }`}
                >
                  {t("delete_selected")}
                  {selectedUnits.length > 0 ? ` (${selectedUnits.length})` : ""}
                </Button>
              </Popconfirm>
            </div>

            {/* Right side: Pagination controls */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{t("page_size")}:</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="px-2 py-1 border border-gray-300 rounded text-sm"
              >
                <option value={6}>6</option>
                <option value={12}>12</option>
                <option value={24}>24</option>
                <option value={48}>48</option>
              </select>

              <span className="text-sm text-gray-600">
                {t("page")} {currentPage} /{" "}
                {Math.ceil(filteredUnits.length / pageSize)}
              </span>

              <Button
                size="small"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className={`font-medium text-sm transition-all duration-200 ${
                  currentPage === 1
                    ? "bg-gray-100 text-gray-400 border-gray-200 opacity-50"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                {t("prev")}
              </Button>
              <Button
                size="small"
                disabled={
                  currentPage >= Math.ceil(filteredUnits.length / pageSize)
                }
                onClick={() => setCurrentPage(currentPage + 1)}
                className={`font-medium text-sm transition-all duration-200 ${
                  currentPage >= Math.ceil(filteredUnits.length / pageSize)
                    ? "bg-gray-100 text-gray-400 border-gray-200 opacity-50"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                {t("next")}
              </Button>
            </div>
          </div>

          {/* Medium screens: horizontal layout */}
          <div className="hidden md:block lg:hidden mb-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              {/* Left side: Selection controls */}
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={isAllSelected}
                  indeterminate={isIndeterminate}
                  onChange={handleSelectAll}
                  className="text-sm font-medium"
                >
                  {t("select_all")}
                </Checkbox>
                <Popconfirm
                  title={t("delete_confirm_title")}
                  description={t("delete_confirm_desc")}
                  onConfirm={handleDeleteSelected}
                  okText={t("ok")}
                  cancelText={t("cancel")}
                  trigger="click"
                >
                  <Button
                    type="primary"
                    danger
                    disabled={selectedUnits.length === 0}
                    size="small"
                    className={`font-medium text-xs transition-all duration-200 ${
                      selectedUnits.length === 0
                        ? "bg-gray-100 text-gray-400 border-gray-200 opacity-50"
                        : "bg-white text-red-600 border-red-600 hover:bg-red-50"
                    }`}
                  >
                    {t("delete_selected")}
                    {selectedUnits.length > 0
                      ? ` (${selectedUnits.length})`
                      : ""}
                  </Button>
                </Popconfirm>
              </div>

              {/* Right side: Pagination controls */}
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">Size:</span>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="px-2 py-1 border border-gray-300 rounded text-sm"
                >
                  <option value={6}>6</option>
                  <option value={12}>12</option>
                  <option value={24}>24</option>
                  <option value={48}>48</option>
                </select>

                <span className="text-sm text-gray-600">
                  {currentPage}/{Math.ceil(filteredUnits.length / pageSize)}
                </span>

                <Button
                  size="small"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                  className={`font-medium text-xs transition-all duration-200 ${
                    currentPage === 1
                      ? "bg-gray-100 text-gray-400 border-gray-200 opacity-50"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  ←
                </Button>
                <Button
                  size="small"
                  disabled={
                    currentPage >= Math.ceil(filteredUnits.length / pageSize)
                  }
                  onClick={() => setCurrentPage(currentPage + 1)}
                  className={`font-medium text-xs transition-all duration-200 ${
                    currentPage >= Math.ceil(filteredUnits.length / pageSize)
                      ? "bg-gray-100 text-gray-400 border-gray-200 opacity-50"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  →
                </Button>
              </div>
            </div>
          </div>

          {/* Small screens: mobile layout */}
          <div className="block md:hidden mb-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              {/* Left side: Selection controls */}
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={isAllSelected}
                  indeterminate={isIndeterminate}
                  onChange={handleSelectAll}
                  className="text-sm"
                >
                  All
                </Checkbox>
                <Popconfirm
                  title={t("delete_confirm_title")}
                  description={t("delete_confirm_desc")}
                  onConfirm={handleDeleteSelected}
                  okText={t("ok")}
                  cancelText={t("cancel")}
                  trigger="click"
                >
                  <Button
                    type="primary"
                    danger
                    disabled={selectedUnits.length === 0}
                    size="small"
                    className={`font-medium text-xs transition-all duration-200 ${
                      selectedUnits.length === 0
                        ? "bg-gray-100 text-gray-400 border-gray-200 opacity-50"
                        : "bg-white text-red-600 border-red-600 hover:bg-red-50"
                    }`}
                  >
                    Delete ({selectedUnits.length})
                  </Button>
                </Popconfirm>
              </div>

              {/* Right side: Pagination controls */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-600">Size:</span>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="px-1 py-1 border border-gray-300 rounded text-xs"
                >
                  <option value={6}>6</option>
                  <option value={12}>12</option>
                  <option value={24}>24</option>
                  <option value={48}>48</option>
                </select>

                <span className="text-xs text-gray-600">
                  {currentPage}/{Math.ceil(filteredUnits.length / pageSize)}
                </span>

                <Button
                  size="small"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                  className={`font-medium text-xs transition-all duration-200 ${
                    currentPage === 1
                      ? "bg-gray-100 text-gray-400 border-gray-200 opacity-50"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  ←
                </Button>
                <Button
                  size="small"
                  disabled={
                    currentPage >= Math.ceil(filteredUnits.length / pageSize)
                  }
                  onClick={() => setCurrentPage(currentPage + 1)}
                  className={`font-medium text-xs transition-all duration-200 ${
                    currentPage >= Math.ceil(filteredUnits.length / pageSize)
                      ? "bg-gray-100 text-gray-400 border-gray-200 opacity-50"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  →
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Create unit modal */}
      <Modal
        title={
          <span className="text-2xl font-bold text-gray-800">
            {t("create_new_unit")}
          </span>
        }
        open={isModalVisible}
        onOk={handleCreate}
        onCancel={handleCancel}
        okText={<span className="font-semibold">{t("create")}</span>}
        cancelText={<span className="font-medium">{t("cancel")}</span>}
        width={600}
        centered
        destroyOnClose
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("unit_name")}
            </label>
            <Input
              placeholder={t("input_unit_name_placeholder")}
              value={newUnitName}
              onChange={(e) => setNewUnitName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
          </div>
        </div>
      </Modal>

      {/* Import modal */}
      <ImportModal
        visible={isImportModalVisible}
        onCancel={() => setIsImportModalVisible(false)}
        onOk={handleImportConfirm}
        title={t("import_all")}
      />

      {/* Help modal */}
      <Modal
        open={helpVisible}
        title={t("help_title")}
        onCancel={() => setHelpVisible(false)}
        footer={null}
      >
        <div className="mb-4">
          <b>{t("help_csv_title_unit")}</b>
          <div className="text-gray-600 text-sm mt-2 mb-2">
            {t("help_csv_desc_unit")}
          </div>
          <pre className="bg-gray-100 p-3 rounded text-sm">
            {t("help_csv_example_unit")}
          </pre>
        </div>
        <div className="mb-4">
          <b>{t("help_json_title_unit")}</b>
          <div className="text-gray-600 text-sm mt-2 mb-2">
            {t("help_json_desc_unit")}
          </div>
          <pre className="bg-gray-100 p-3 rounded text-sm">
            {t("help_json_example_unit")}
          </pre>
        </div>
        <div className="text-right">
          <Button
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold transition-all duration-200 rounded-lg px-4 py-2 text-base shadow-md hover:shadow-lg justify-center"
            onClick={() => setHelpVisible(false)}
          >
            {t("help_close")}
          </Button>
        </div>
      </Modal>

      {/* Unit cards grid */}
      <div className="px-5 pb-5">
        {paginatedUnits.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedUnits.map((unit) => (
              <UnitCard
                key={unit.id}
                unit={unit}
                isSelected={selectedUnits.includes(unit.id)}
                onSelect={() => handleSelectUnit(unit.id)}
                onEdit={(unitId, values) => handleEditUnit(unitId, values)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-600">
            <div className="text-lg font-medium mb-3">
              {searchTerm ? t("no_search_results") : t("no_units")}
            </div>
            <div className="text-sm text-gray-500 leading-relaxed">
              {searchTerm
                ? t("no_search_results_tip", { term: searchTerm })
                : t("no_units_tip")}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UnitList;
