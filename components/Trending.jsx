import { View, FlatList, TouchableOpacity, ImageBackground, Image, Dimensions } from 'react-native';
import React, { useState } from 'react';
import * as Animatable from "react-native-animatable";
import WebView from 'react-native-webview';
import { icons } from '../constants';

const zoomIn = {
  0: { scale: 0.9 },
  1: { scale: 1.1 },
};

const zoomOut = {
  0: { scale: 1.1 },
  1: { scale: 0.9 },
};

// Helper function to get embedded URL
const getEmbedUrl = (url) => {
  // If it's already an embed URL, return it
  if (url.includes('player.vimeo.com')) {
    return url;
  }
  // Otherwise, convert regular URL to embed URL
  const vimeoId = url.match(/vimeo\.com\/(\d+)/);
  return vimeoId ? `https://player.vimeo.com/video/${vimeoId[1]}` : url;
};

const TrendingItem = ({ activeItem, item }) => {
  const [showVideo, setShowVideo] = useState(false);

  // HTML to embed Vimeo player with custom styling
  const getVimeoHtml = (videoUrl) => `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            margin: 0;
            padding: 0;
            background-color: black;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
          }
          iframe {
            width: 100%;
            height: 100%;
            border: none;
          }
        </style>
      </head>
      <body>
        <iframe
          src="${getEmbedUrl(videoUrl)}?autoplay=1&title=0&byline=0&portrait=0"
          allow="autoplay; fullscreen"
          allowfullscreen
        ></iframe>
      </body>
    </html>
  `;

  return (
    <Animatable.View
      className="mr-5"
      animation={activeItem === item.$id ? zoomIn : zoomOut}
      duration={500}
    >
      {showVideo ? (
        <View className="w-52 h-72 rounded-[33px] mt-3 bg-black overflow-hidden">
          <WebView
            source={{ html: getVimeoHtml(item.video) }}
            style={{ flex: 1 }}
            allowsFullscreenVideo
            allowsInlineMediaPlayback
            mediaPlaybackRequiresUserAction={false}
            javaScriptEnabled={true}
            domStorageEnabled={true}
          />
        </View>
      ) : (
        <TouchableOpacity
          className="relative flex justify-center items-center"
          activeOpacity={0.7}
          onPress={() => setShowVideo(true)}
        >
          <ImageBackground
            source={{
              uri: item.thumbnail,
            }}
            className="w-52 h-72 rounded-[33px] my-5 overflow-hidden shadow-lg shadow-black/40"
            resizeMode="cover"
          />
          <Image
            source={icons.play}
            className="w-12 h-12 absolute"
            resizeMode="contain"
          />
        </TouchableOpacity>
      )}
    </Animatable.View>
  );
};

const Trending = ({ posts }) => {
  const [activeItem, setActiveItem] = useState(posts[0]?.$id);

  const viewableItemsChanged = ({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setActiveItem(viewableItems[0].item.$id);
    }
  };

  return (
    <FlatList
      data={posts}
      keyExtractor={(item) => item.$id}
      renderItem={({ item }) => (
        <TrendingItem activeItem={activeItem} item={item} />
      )}
      onViewableItemsChanged={viewableItemsChanged}
      viewabilityConfig={{
        itemVisiblePercentThreshold: 70,
      }}
      contentOffset={{ x: 170 }}
      horizontal
    />
  );
};

export default Trending;