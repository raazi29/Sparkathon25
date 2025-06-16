Here's the fixed version with all missing closing brackets added:

```javascript
                                  })}
                                  className="p-2 text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors"
                                  title="Add to cart"
                                >
                                  <ShoppingBag size={16} />
                                </button>
                                <button
                                  className="p-2 text-gray-500 hover:text-pink-400 hover:bg-pink-500/10 rounded-lg transition-colors"
                                  title="Save for later"
                                >
                                  <Heart size={16} />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Suggestions */}
                    {message.suggestions && message.suggestions.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {message.suggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => handleSendMessage(suggestion)}
                            className="px-3 py-1.5 bg-gray-800/50 hover:bg-gray-700/50 text-gray-400 hover:text-cyan-300 rounded-full text-sm transition-all border border-gray-700/50 hover:border-cyan-500/30"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {/* Typing Indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex items-center space-x-2 text-gray-500"
            >
              <Loader className="animate-spin" size={16} />
              <span className="text-sm">ARIA is typing...</span>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      {/* Input Area */}
      <div className="bg-black/95 backdrop-blur-xl border-t border-gray-800/50 p-4 sticky bottom-0">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end space-x-2">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Ask me anything about products, fashion, or shopping..."
                className="w-full bg-gray-900/80 text-white placeholder-gray-500 rounded-2xl py-3 px-4 pr-12 resize-none border border-gray-800/50 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 focus:outline-none"
                rows={1}
              />
              <div className="absolute right-2 bottom-2 flex items-center space-x-1">
                <button
                  onClick={() => setShowImageUpload(!showImageUpload)}
                  className="p-2 text-gray-500 hover:text-cyan-400 hover:bg-gray-800/50 rounded-lg transition-colors"
                  title="Upload image"
                >
                  <ImageIcon size={18} />
                </button>
                {speechSupported && (
                  <button
                    onClick={toggleVoiceInput}
                    className={`p-2 rounded-lg transition-colors ${
                      isListening
                        ? 'text-red-400 hover:text-red-300 hover:bg-red-500/10'
                        : 'text-gray-500 hover:text-cyan-400 hover:bg-gray-800/50'
                    }`}
                    title={isListening ? 'Stop recording' : 'Start voice input'}
                  >
                    {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                  </button>
                )}
              </div>
            </div>
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim() && !isListening}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white p-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              <Send size={18} />
            </button>
          </div>
          
          {/* Image Upload Panel */}
          <AnimatePresence>
            {showImageUpload && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-4 p-4 bg-gray-900/80 rounded-lg border border-gray-800/50"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-300">Upload Image</h3>
                  <button
                    onClick={() => setShowImageUpload(false)}
                    className="text-gray-500 hover:text-gray-400"
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file);
                      }}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full flex items-center justify-center space-x-2 p-4 border-2 border-dashed border-gray-700 hover:border-cyan-500/50 rounded-lg transition-colors"
                    >
                      <Upload size={20} className="text-gray-500" />
                      <span className="text-sm text-gray-400">Upload from device</span>
                    </button>
                  </div>
                  <div>
                    <button
                      onClick={startCamera}
                      className="w-full flex items-center justify-center space-x-2 p-4 border-2 border-dashed border-gray-700 hover:border-cyan-500/50 rounded-lg transition-colors"
                    >
                      <Camera size={20} className="text-gray-500" />
                      <span className="text-sm text-gray-400">Take a photo</span>
                    </button>
                  </div>
                </div>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="mt-4 w-full rounded-lg hidden"
                />
                <canvas
                  ref={canvasRef}
                  className="hidden"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
```