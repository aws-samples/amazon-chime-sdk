// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

<<<<<<< HEAD
import React, { useState } from "react";
import { withTheme } from "styled-components";
import Select from "react-select";

export const MultiSelect = (props) => {
  const [inputValue, setInputValue] = useState("");
=======
import React, { useState } from 'react';
import { withTheme } from 'styled-components';
import Select from 'react-select';

export const MultiSelect = (props) => {
  const [inputValue, setInputValue] = useState('');
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1

  const handleChange = (selections) => props.onChange(selections);

  const getCustomStyles = () => {
    const { theme } = props;
    const customStyles = {
      option: (provided, state) => ({
        ...provided,
<<<<<<< HEAD
        transition: "background-color .05s ease-in",
        backgroundColor: state.isFocused
          ? `${theme.colors.primary.light}`
          : `${theme.colors.greys.white}`,
        color: state.isFocused
          ? `${theme.colors.greys.white}`
          : `${theme.colors.greys.grey70}`,
        padding: 16,
        "&:first-of-type": {
          borderRadius: `${theme.radii.default} ${theme.radii.default} 0 0`,
        },
        "&:last-of-type": {
          borderRadius: `0 0 ${theme.radii.default} ${theme.radii.default}`,
        },
        "&:hover": {
          backgroundColor: `${theme.colors.primary.light}`,
          color: `${theme.colors.greys.white}`,
        },
=======
        transition: 'background-color .05s ease-in',
        backgroundColor: state.isFocused ? `${theme.colors.primary.light}` : `${theme.colors.greys.white}`,
        color: state.isFocused ? `${theme.colors.greys.white}` : `${theme.colors.greys.grey70}`,
        padding: 16,
        '&:first-of-type': {
          borderRadius: `${theme.radii.default} ${theme.radii.default} 0 0`
        },
        '&:last-of-type': {
          borderRadius: `0 0 ${theme.radii.default} ${theme.radii.default}`
        },
        '&:hover': {
          backgroundColor: `${theme.colors.primary.light}`,
          color: `${theme.colors.greys.white}`
        }
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
      }),

      menu: (provided) => ({
        ...provided,
<<<<<<< HEAD
        marginBottom: "2rem",
        boxShadow: "none",
        position: "relative",
=======
        marginBottom: '2rem',
        boxShadow: 'none',
        position: 'relative'
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
      }),

      control: (provided) => ({
        ...provided,
<<<<<<< HEAD
        boxShadow: "0 0.0625rem 0.0625rem 0 rgba(0, 0, 0, 0.1)",
        margin: "2rem 0",
=======
        boxShadow: '0 0.0625rem 0.0625rem 0 rgba(0, 0, 0, 0.1)',
        margin: '2rem 0',
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
        background: `${theme.colors.greys.white}`,
        border: `0.03125rem solid ${theme.colors.greys.grey30}`,
        borderRadius: theme.radii.default,
        color: `${theme.colors.greys.grey80}`,
        fontSize: `${theme.fontSizes.text.fontSize}`,
        lineHeight: `${theme.fontSizes.text.lineHeight}`,
<<<<<<< HEAD
        "&:focus-within": {
          boxShadow: `0 0 0 0.125rem ${theme.colors.primary.lightest}`,
        },
        "&:hover": {
          borderColor: "none",
        },
      }),
      menuList: () => ({
        padding: 0,
        boxShadow: "0 1px 4px 0 rgba(0, 0, 0, 0.1)",
=======
        '&:focus-within': {
          boxShadow: `0 0 0 0.125rem ${theme.colors.primary.lightest}`
        },
        '&:hover': {
          borderColor: 'none'
        }
      }),
      menuList: () => ({
        padding: 0,
        boxShadow: '0 1px 4px 0 rgba(0, 0, 0, 0.1)'

>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
      }),
      multiValue: (provided) => ({
        ...provided,
        backgroundColor: `${theme.colors.primary.light}`,
<<<<<<< HEAD
        borderRadius: "1rem",
        color: `${theme.colors.greys.white}`,
=======
        borderRadius: '1rem',
        color: `${theme.colors.greys.white}`
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
      }),
      multiValueLabel: (provided) => ({
        ...provided,
        color: `${theme.colors.greys.white}`,
<<<<<<< HEAD
        fontWeight: "bolder",
      }),
=======
        fontWeight: 'bolder'
      })
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
    };
    return customStyles;
  };

  const onInputChange = (inputValue, { action }) => {
    switch (action) {
<<<<<<< HEAD
      case "input-change":
        setInputValue(inputValue);
        return;
      case "set-value":
        setInputValue("");
=======
      case 'input-change':
        setInputValue(inputValue);
        return;
      case 'set-value':
        setInputValue('');
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1

      default:
    }
  };

  return (
    <Select
      closeMenuOnSelect={false}
      components={{
        DropdownIndicator: () => null,
<<<<<<< HEAD
        IndicatorSeparator: () => null,
=======
        IndicatorSeparator: () => null
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
      }}
      defaultMenuIsOpen
      inputValue={inputValue}
      isSearchable
      onChange={handleChange}
      onInputChange={onInputChange}
      hideSelectedOptions
      menuIsOpen
<<<<<<< HEAD
      options={props.options.filter((o) => o.label && o.value)}
=======
      options={props.options.filter(o => o.label && o.value)}
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
      styles={getCustomStyles()}
      captureMenuScroll={false}
    />
  );
};

export default withTheme(MultiSelect);
