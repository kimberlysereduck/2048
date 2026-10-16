import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Code2, X, Copy, Check, FileCode, Smartphone } from 'lucide-react';

interface ComposeCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ComposeCodeModal: React.FC<ComposeCodeModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  const composeCodeSnippet = `package com.example.game2048compose

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.hapticfeedback.HapticFeedbackType
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.google.firebase.firestore.ktx.firestore
import com.google.firebase.ktx.Firebase
import kotlin.math.abs

// Model for 2048 Tile in Jetpack Compose
data class Tile(val id: Long, val value: Int, var row: Int, var col: Int)

@Composable
fun Game2048Screen() {
    val haptic = LocalHapticFeedback.current
    var score by remember { mutableStateOf(0) }
    var bestScore by remember { mutableStateOf(0) }
    var tiles by remember { mutableStateOf(listOf<Tile>()) }
    val firestore = Firebase.firestore

    Surface(
        modifier = Modifier.fillMaxSize(),
        color = MaterialTheme.colorScheme.background
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Android Top Bar & Scores
            ScoreHeader(score = score, bestScore = bestScore)

            Spacer(modifier = Modifier.height(24.dp))

            // 4x4 Jetpack Compose Board with Swipe Gestures & Haptics
            Box(
                modifier = Modifier
                    .size(360.dp)
                    .clip(RoundedCornerShape(24.dp))
                    .background(Color(0xFF211F26))
                    .padding(12.dp)
                    .pointerInput(Unit) {
                        detectDragGestures(
                            onDragEnd = { /* finish gesture */ }
                        ) { change, dragAmount ->
                            change.consume()
                            val (x, y) = dragAmount
                            if (abs(x) > abs(y) && abs(x) > 20f) {
                                if (x > 0) move("RIGHT") else move("LEFT")
                                haptic.performHapticFeedback(HapticFeedbackType.TextHandleMove)
                            } else if (abs(y) > 20f) {
                                if (y > 0) move("DOWN") else move("UP")
                                haptic.performHapticFeedback(HapticFeedbackType.TextHandleMove)
                            }
                        }
                    }
            ) {
                // Empty Grid Cells & Animated Tiles using Compose Animatable
                GridCells()
                tiles.forEach { tile ->
                    AnimatedTileComposable(tile = tile)
                }
            }
        }
    }
}

// Function to upload high score to Firebase Firestore across devices
fun submitScoreToFirebase(playerName: String, score: Int, highestTile: Int) {
    val data = hashMapOf(
        "playerName" to playerName,
        "score" to score,
        "highestTile" to highestTile,
        "devicePlatform" to "Android Compose",
        "createdAt" to com.google.firebase.firestore.FieldValue.serverTimestamp()
    )
    Firebase.firestore.collection("leaderboard").add(data)
}
`;

  const handleCopy = () => {
    navigator.clipboard.writeText(composeCodeSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 backdrop-blur-md bg-black/65">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-xl max-h-[88vh] bg-[#1d1b20] text-[#e6e0e9] rounded-[32px] border border-white/10 shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 pt-5 pb-3 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold tracking-tight">Jetpack Compose Source</h3>
              <p className="text-[11px] text-gray-400">Native Android Kotlin + Firebase architecture</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 active:scale-95 text-white transition-all shadow"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Compose Code</span>
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 active:scale-95 transition-all text-gray-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Code Content */}
        <div className="flex-1 overflow-y-auto p-4 bg-[#141218]">
          <pre className="text-[11px] font-mono leading-relaxed text-purple-200/90 whitespace-pre overflow-x-auto p-3 rounded-2xl bg-black/40 border border-white/5">
            <code>{composeCodeSnippet}</code>
          </pre>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-white/10 bg-[#16141a] flex items-center justify-between text-[11px] text-gray-400">
          <span>Target: Android Studio Iguana+ (Kotlin 2.0 / Compose M3)</span>
          <button
            onClick={onClose}
            className="font-semibold text-purple-400 hover:text-purple-300"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};
