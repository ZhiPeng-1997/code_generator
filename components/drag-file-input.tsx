"use client";

import { useCallback, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type Props = {
  multiple?: boolean;
  accept?: string;               // 例："image/*,.pdf"
  onFiles: (files: File[]) => void;
};

export default function DragFileInput({ multiple = false, accept, onFiles }: Props) {
  const [drag, setDrag] = useState(false);

  /* 统一处理 FileList → File[] */
  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    const arr = Array.from(fileList);
    onFiles(multiple ? arr : arr.slice(0, 1));
  };

  /* 拖拽事件 */
  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDrag(false);
      handleFiles(e.dataTransfer.files);
    },
    [multiple, onFiles]
  );

  return (
    <Label
      onDragOver={(e) => {
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={onDrop}
      className={cn(
        "group relative flex h-32 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-border px-4 transition",
        drag ? "border-primary bg-primary/5" : "hover:border-primary/50"
      )}
    >
      {/* 真实文件输入，隐藏起来 */}
      <Input
        type="file"
        multiple={multiple}
        accept={accept}
        className="absolute inset-0 h-full w-full opacity-0"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {/* 自定义提示 */}
      <div className="pointer-events-none text-center text-sm text-muted-foreground">
        <p className="font-medium">点击或拖拽文件到此处</p>
        <p className="text-xs">{multiple ? "支持多文件" : "仅单文件"}</p>
      </div>
    </Label>
  );
}