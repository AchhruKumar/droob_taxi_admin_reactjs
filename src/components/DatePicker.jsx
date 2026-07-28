import { useState } from 'react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';

export function DatePicker({ selectedDate, onDateChange, placeholder = "Pick a date" }) {
  const [internalDate, setInternalDate] = useState(undefined);

  const date = selectedDate ?? internalDate;
  const setDate = (date) => {
    if (onDateChange) {
      onDateChange(date);
    } else {
      setInternalDate(date);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="secondary"
          data-empty={!date}
          className="data-[empty=true]:text-muted-foreground justify-between text-left font-normal"
        >
          {date ? format(date, "dd/MM/yyyy") : <span>{placeholder}</span>}
          <CalendarIcon />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar mode="single" selected={date} onSelect={setDate} />
      </PopoverContent>
    </Popover>
  );
}