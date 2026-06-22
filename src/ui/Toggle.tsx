interface ToggleProps {
    checked: boolean;
    onChange: () => void;
    disabled?: boolean;
}

export function Toggle({ checked, onChange, disabled }: ToggleProps) {
    return (
        <button
            type="button"
            onClick={onChange}
            disabled={disabled}
            className={`relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none disabled:opacity-50 flex-shrink-0 ${checked ? "bg-teal-500" : "bg-slate-200 dark:bg-zinc-700"}`}
        >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${checked ? "translate-x-6" : "translate-x-0"}`} />
        </button>
    );
}
