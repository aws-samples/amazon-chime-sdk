/*
 * MainFragment.kt
 * Android WebView Sample Demo
 *
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */
package com.amazonaws.android_webview_sample

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.navigation.fragment.NavHostFragment
import com.amazonaws.android_webview_sample.databinding.FragmentMainBinding

class MainFragment : Fragment() {
    private var binding: FragmentMainBinding? = null
    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        binding = FragmentMainBinding.inflate(inflater, container, false)
        return binding!!.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        binding!!.buttonFirst.setOnClickListener(View.OnClickListener {
            NavHostFragment.findNavController(this@MainFragment)
                .navigate(R.id.action_MainFragment_to_WebViewFragment)
        })
    }

    override fun onDestroyView() {
        super.onDestroyView()
        binding = null
    }
}