import React from 'react'

const InputDashProduct = ({type, id, name, value, onChange}) => {
  return (
    <input
        type={type}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        className='mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2
            px-3 text-white focus:outline-none focus:ring-2
        focus:ring-emerald-500 focus:border-emerald-500'
        required
    />
  )
}

export default InputDashProduct