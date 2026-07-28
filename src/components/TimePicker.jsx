import { Clock } from 'lucide-react';
import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const TimePicker = ({ selected, onChange, placeholder, className, icon }) => {
    return (
        <div className='relative w-full'>
            <DatePicker
                selected={selected}
                onChange={onChange}
                showTimeSelect
                showTimeSelectOnly
                timeIntervals={15}
                timeCaption="Time"
                dateFormat="hh:mm aa"
                placeholderText={placeholder || 'Select time'}
                className={
                    className ||
                    'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex py-5 px-5 w-full min-w-0 rounded-md bg-droobGray-200 leading-none text-sm h-12 shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive'
                }
            />
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                {icon || <Clock size={20} />}
            </div>
        </div>
    );
};

export default TimePicker;