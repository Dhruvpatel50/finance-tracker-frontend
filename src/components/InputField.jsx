const InputField = ({ label, type, value, onChange, placeholder, error, icon }) => (
    <div className="mb-4">
        <label className="block text-gray-700 text-sm font-medium mb-2">{label}</label>
        <div className="relative">
            {icon && (
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    {icon}
                </div>
            )}
            <input
                type={type}
                value={value}
                onChange={onChange}
                className={`w-full ${icon ? 'pl-10' : 'pl-4'} pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition duration-200 ${error ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                placeholder={placeholder}
            />
        </div>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
);

export default InputField;