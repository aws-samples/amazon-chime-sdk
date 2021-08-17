/*
 * AndroidWebView_UITest.kt
 * Android WebView Sample Demo
 *
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

package com.amazonaws.android_webview_sample

import android.view.View
import android.view.ViewGroup
import androidx.test.espresso.Espresso.onView
import androidx.test.espresso.action.ViewActions.click
import androidx.test.espresso.matcher.ViewMatchers.withId
import androidx.test.espresso.web.sugar.Web
import androidx.test.espresso.web.webdriver.DriverAtoms
import androidx.test.espresso.web.webdriver.Locator
import androidx.test.filters.LargeTest
import androidx.test.rule.ActivityTestRule
import androidx.test.rule.GrantPermissionRule
import androidx.test.runner.AndroidJUnit4
import org.hamcrest.Description
import org.hamcrest.Matcher
import org.hamcrest.TypeSafeMatcher
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import java.util.UUID

@LargeTest
@RunWith(AndroidJUnit4::class)
class AndroidWebView_UITest {
    var webLoadTime = 10000L
    @Rule
    @JvmField
    // Run MainActivity
    var mActivityTestRule = ActivityTestRule(MainActivity::class.java)

    @Rule
    @JvmField
    // Grant protected permissions
    var mGrantPermissionRule =
            GrantPermissionRule.grant(
                    "android.permission.CAMERA",
                    "android.permission.RECORD_AUDIO")

    @Test
    fun mainActivityTest() {
        // Press button to open
        val materialButton = onView(withId(R.id.button_first))
        materialButton.perform(click())

        // Wait for page to load
        Thread.sleep(webLoadTime)

        // Enter a random meeting
        Web.onWebView().withElement(DriverAtoms.findElement(Locator.ID, "inputMeeting")).perform(
            DriverAtoms.webKeys(
                UUID.randomUUID().toString()))
        Web.onWebView().withElement(DriverAtoms.findElement(Locator.ID, "inputName")).perform(
            DriverAtoms.webKeys(
                UUID.randomUUID().toString()))
        Web.onWebView().withElement(
            DriverAtoms.findElement(
                Locator.ID,
                "authenticate"
            )
        ).perform(DriverAtoms.webClick())

        // Wait for the device page
        Thread.sleep(webLoadTime)

        // Join the meeting
        Web.onWebView().withElement(
            DriverAtoms.findElement(
                Locator.ID,
                "joinButton"
            )
        ).perform(DriverAtoms.webClick())

        // Wait to join the meeting
        Thread.sleep(webLoadTime)

        // Check for the microphone and camera button
        Web.onWebView().withElement(
            DriverAtoms.findElement(
                Locator.ID,
                "button-microphone"
            )
        )
        Web.onWebView().withElement(
            DriverAtoms.findElement(
                Locator.ID,
                "button-camera"
            )
        )
    }
    
    private fun childAtPosition(
            parentMatcher: Matcher<View>, position: Int): Matcher<View> {

            return object : TypeSafeMatcher<View>() {
            override fun describeTo(description: Description) {
                description.appendText("Child at position $position in parent ")
                parentMatcher.describeTo(description)
            }

            public override fun matchesSafely(view: View): Boolean {
                val parent = view.parent
                return parent is ViewGroup && parentMatcher.matches(parent)
                        && view == parent.getChildAt(position)
            }
        }
    }
    }
