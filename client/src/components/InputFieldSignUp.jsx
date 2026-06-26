import React from 'react'

const InputFieldSignUp = ({id, type, placeholder, value, onChange}) => {

  return (
        <input
            id={id}
            type={type}
            required
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className='block w-full px-3 py-2 pl-10 bg-gray-700 border border-gray-600 rounded-md shadow-sm
                placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm'
        />
  )
}

export default InputFieldSignUp