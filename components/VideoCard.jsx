import { View, Text, Image, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { icons } from '../constants'
import WebView from 'react-native-webview';


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


const VideoCard = ({ video: { title,  thumbnail, video, creator, creator:{avatar} } }) => {  
  const [play, setPlay] = useState(false);

  
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
    <View className="flex flex-col items-center px-4 mb-14">
      <View className="flex flex-row gap-3 items-start">
        <View className="flex justify-center items-center flex-row flex-1">
          <View className="w-[46px] h-[46px] rounded-lg border border-secondary flex justify-center items-center p-0.5">
            <Image
              source={{ uri: avatar }}
              className="w-full h-full rounded-lg"
              resizeMode="cover"
            />
          </View>

          <View className="flex justify-center flex-1 ml-3 gap-y-1">
            <Text
              className="font-psemibold text-sm text-white"
              numberOfLines={1}
            >
              {title}
            </Text>
            <Text
              className="text-xs text-gray-100 font-pregular"
              numberOfLines={1}
            >{creator.username}
            </Text>
          </View>
        </View>

        <View className="pt-2">
          <Image source={icons.menu} className="w-5 h-5" resizeMode="contain" />
        </View>
      </View>
      
      {play ? (
        <View className="w-full h-60 rounded-xl mt-3">
        <WebView
          source={{ html: getVimeoHtml(video) }}
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
          activeOpacity={0.7}
          onPress={() => setPlay(true)}
          className="w-full h-60 rounded-xl mt-3 relative flex justify-center items-center"
        >
          <Image
            source={{ uri: thumbnail }}
            className="w-full h-full rounded-xl mt-3"
            resizeMode="cover"
          />

          <Image
            source={icons.play}
            className="w-12 h-12 absolute"
            resizeMode="contain"
          />
        </TouchableOpacity>
      )}
    </View>
  )
}

export default VideoCard