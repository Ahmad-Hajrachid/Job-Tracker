import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the client
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

// Get the model that supports file uploads
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

export async function chat(messages) {
  const prompt = formatMessagesForGemini(messages);
  
  const result = await model.generateContent({
    contents: prompt,
    generationConfig: {
      temperature: 0.7,
    },
  });
  
  const response = await result.response;
  return response.text();
}

// Function specifically for PDF analysis
export async function chatWithPDF(pdfFile, analysisPrompt) {
  try {
    // Convert file to base64 or use the file directly
    const fileData = await fileToGenerativePart(pdfFile);
    
    const prompt = [
      {
        role: 'user',
        parts: [
          { text: analysisPrompt },
          fileData // Include the PDF file
        ]
      }
    ];
    
    const result = await model.generateContent({
      contents: prompt,
      generationConfig: {
        temperature: 0.7,
      },
    });
    
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error analyzing PDF:', error);
    throw error;
  }
}

// Helper function to convert File to GenerativePart
async function fileToGenerativePart(file) {
  const base64EncodedDataPromise = new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(',')[1]);
    reader.readAsDataURL(file);
  });
  
  return {
    inlineData: {
      data: await base64EncodedDataPromise,
      mimeType: file.type
    }
  };
}

// Enhanced function that can handle both text messages and PDF files
export async function chatWithFiles(messages, files = []) {
  try {
    const prompt = await formatMessagesWithFiles(messages, files);
    
    const result = await model.generateContent({
      contents: prompt,
      generationConfig: {
        temperature: 0.7,
      },
    });
    
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error in chat with files:', error);
    throw error;
  }
}

// Helper function to format messages with file support
async function formatMessagesWithFiles(messages, files) {
  const formattedMessages = [];
  
  for (const message of messages) {
    let role;
    switch (message.role) {
      case 'system':
        role = 'user';
        break;
      case 'user':
        role = 'user';
        break;
      case 'assistant':
        role = 'model';
        break;
      default:
        role = 'user';
    }
    
    const parts = [{ text: message.content }];
    
    // Add files to the last user message (or create a new one)
    if (role === 'user' && files.length > 0 && message === messages[messages.length - 1]) {
      for (const file of files) {
        const filePart = await fileToGenerativePart(file);
        parts.push(filePart);
      }
    }
    
    formattedMessages.push({
      role: role,
      parts: parts
    });
  }
  
  return formattedMessages;
}

// Helper function to convert message format to Gemini format (original)
function formatMessagesForGemini(messages) {
  return messages.map(message => {
    let role;
    switch (message.role) {
      case 'system':
        role = 'user';
        break;
      case 'user':
        role = 'user';
        break;
      case 'assistant':
        role = 'model';
        break;
      default:
        role = 'user';
    }
    
    return {
      role: role,
      parts: [{ text: message.content }]
    };
  });
}