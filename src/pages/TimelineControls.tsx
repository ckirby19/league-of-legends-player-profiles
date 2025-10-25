import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

interface TimelineControlsProps {
  currentMinute: number;
  duration: number;
  isPlaying: boolean;
  onPlayToggle: () => void;
  onSeek: (minute: number) => void;
}

export const TimelineControls = ({
  currentMinute,
  duration,
  isPlaying,
  onPlayToggle,
  onSeek,
}: TimelineControlsProps) => {
  return (
    <div className="flex flex-col items-center gap-2">
      <Button
        className="py-2 hover:cursor-pointer"
        variant="secondary"
        onClick={onPlayToggle}
      >
        {isPlaying ? "Pause" : "Play"}
      </Button>
      <Slider
        value={[currentMinute]}
        min={0}
        max={duration}
        step={1}
        onValueChange={(val: number[]) => onSeek(val[0])}
        className="w-96 bg-gray-200 dark:bg-gray-700 h-2 rounded-lg px-1"
      />
    </div>
  );
};
