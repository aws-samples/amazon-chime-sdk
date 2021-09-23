/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

package com.amazonaws.services.chime.sdkdemo.ui.messaging.view.adapter

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.amazonaws.services.chime.sdkdemo.data.ChannelMessage
import com.amazonaws.services.chime.sdkdemo.databinding.MessageItemBinding

class MessageAdapter :
    ListAdapter<ChannelMessage, MessageHolder>(TaskDiffCallback()) {
    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): MessageHolder {
        val layoutInflater = LayoutInflater.from(parent.context)
        val binding = MessageItemBinding.inflate(layoutInflater, parent, false)
        return MessageHolder(binding)
    }

    override fun onBindViewHolder(holder: MessageHolder, position: Int) {
        val message = getItem(position)
        message?.let { holder.bindMessage(it) }
    }
}

class MessageHolder(val binding: MessageItemBinding) :
    RecyclerView.ViewHolder(binding.root) {

    fun bindMessage(message: ChannelMessage) {
        binding.message = message
        binding.executePendingBindings()
    }
}

class TaskDiffCallback : DiffUtil.ItemCallback<ChannelMessage>() {
    override fun areItemsTheSame(oldItem: ChannelMessage, newItem: ChannelMessage): Boolean {
        return oldItem.messageId == newItem.messageId
    }

    override fun areContentsTheSame(oldItem: ChannelMessage, newItem: ChannelMessage): Boolean {
        return oldItem == newItem
    }
}
