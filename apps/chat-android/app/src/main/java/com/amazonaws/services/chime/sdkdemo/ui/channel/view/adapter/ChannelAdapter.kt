/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

package com.amazonaws.services.chime.sdkdemo.ui.channel.view.adapter

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.amazonaws.services.chime.sdkdemo.R
import com.amazonaws.services.chime.sdkdemo.data.Channel

class ChannelAdapter(private val onClick: (Channel) -> Unit) : ListAdapter<Channel, ChannelAdapter.ChannelItemHolder>(TaskDiffCallback()) {

    class ChannelItemHolder(itemView: View, val onClick: (Channel) -> Unit) :
        RecyclerView.ViewHolder(itemView) {
        private val channelTextview: TextView = itemView.findViewById(R.id.channelListItem)
        private var currentChannel: Channel? = null

        init {
            itemView.setOnClickListener {
                currentChannel?.let {
                    onClick(it)
                }
            }
        }

        fun bind(channel: Channel) {
            currentChannel = channel
            channelTextview.text = channel.name
        }
    }

    /* Creates and inflates view and return ChannelItemHolder. */
    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ChannelItemHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.channel_item, parent, false)
        return ChannelItemHolder(view, onClick)
    }

    /* Gets current channel and uses it to bind view. */
    override fun onBindViewHolder(holder: ChannelItemHolder, position: Int) {
        val channel = getItem(position)
        holder.bind(channel)
    }
}

class TaskDiffCallback : DiffUtil.ItemCallback<Channel>() {
    override fun areItemsTheSame(oldItem: Channel, newItem: Channel): Boolean {
        return oldItem == newItem
    }

    override fun areContentsTheSame(oldItem: Channel, newItem: Channel): Boolean {
        return oldItem.channelArn == newItem.channelArn
    }
}
