const express = require('express')
const router = express.Router()
const alcohlicPerfume = require('../models/alcohlicPerfume')
const user_content = require('../models/user_content')
const trackcredits = require('../models/trackcredits')
const Accounts = require('../models/Accounts')
const RegisterUsers = require('../models/Registeration')
const uploadImg = require('../src/uploader') 
const path = require('path')
const axios = require('axios');
const { Configuration, OpenAIApi } = require("openai");
 // all none alcohlic perfume
// router.post('/call-chatgpt-api', async (req, res) => { 
//  console.log(req.body.prompt, 'req')
// const configuration = new Configuration({ apiKey: "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" });
// const openai = new OpenAIApi(configuration); 
  
//   const prompt = req.body.prompt; 
//   const messages = [
//     { role: 'system', content: 'You: ' + prompt },
//     { role: 'user', content: prompt }
//   ];

//   try {
//     const response = await openai.createChatCompletion({ 
//       model: 'gpt-3.5-turbo',
//       messages:messages,
//     });

//     const botMessage = response.data.choices[0].message.content;

//     res.status(200).json({ content: botMessage });
//   } catch (error) {
//     console.error('Error:', error.message);
//     res.status(500).json({ error: error.message+' An error occurred while calling the OpenAI API.' });
//   }
// })

 

 
const API_KEY = "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";
const API_URL = "https://api.openai.com/v1/chat/completions";

router.post('/call-chatgpt-api', async (req, res) => {
  const prompt = req.body.prompt;
  const messages = [
    // { role: 'system', content: 'You: ' + prompt },
    { role: 'user', content: prompt }
  ];

  const requestData = {
    model: 'gpt-3.5-turbo',
    messages: messages,
  };

  try {
    const botMessage = await makeChatCompletionRequest(requestData);
    res.status(200).json({ content: botMessage });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'An error occurred while calling the OpenAI API.' });
  }
});

async function makeChatCompletionRequest(requestData, numRetries = 3, retryDelay = 9000) {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`
    }
  };

  for (let i = 0; i < numRetries; i++) {
    try {
      const response = await axios.post(API_URL, requestData, config);
      return response.data.choices[0].message.content;
    } catch (error) {
      if (error.response && error.response.status === 429) {
        console.log('Rate limit exceeded. Retrying after delay...');
        await delay(retryDelay);
        retryDelay *= 2; // Exponential backoff
      } else {
        throw error;
      }
    }
  }

  throw new Error('Exceeded maximum number of retries');
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// all none alcohlic perfume
router.get('/frequent-ask-qs', async (req, res) => {
  try {
    const faq = [
      {
        question: "What is Play AI?",
        answer: "Play AI refers to the application of artificial intelligence technology in creating conversational agents or virtual assistants that can engage in human-like conversations with users."
      },
      {
        question: "Is the Play AI App Free?",
        answer: "You'll get only 10 free prompts. If you want more, you can upgrade Play AI to the PRO version."
      },
      {
        question: "How can I log out from Play AI?",
        answer: "To log out from Play AI, please follow the steps: Account => Logout => Yes, Logout."
      },
      {
        question: "Is my personal information safe when using the Play AI App?",
        answer: "Play AI Apps prioritize user privacy and security. They adhere to strict data protection protocols and handle personal information responsibly."
      },
      {
        question: "Can Play AI understand multiple languages?",
        answer: "Play AI supports major languages such as Hindi, French, Spanish, German, Bengali, and Indonesian. It has the capability to understand and respond in different languages."
      },
      {
        question: "Is Play AI available offline?",
        answer: "No, Play AI is available online only."
      },
      {
        question: "Is Play AI only for text-based conversations?",
        answer: "Yes, Play AI supports text-based conversations and offers voice recognition, allowing users to interact through spoken language."
      },
      {
        question: "Is Play AI able to recognize images or provide visual search functionality?",
        answer: "No, for now, our primary focus is on text-based interactions and voice recognition."
      },
      {
        question: "Is Play AI capable of understanding user emotions?",
        answer: "Yes, Advanced Play AI can utilize sentiment analysis techniques to understand and respond to user emotions to some extent."
      },
      {
        question: "Can Play AI provide educational content or answer academic questions?",
        answer: "If the user uses a prompt, then yes. If it means a special category, then no. But in the future, we'll provide educational content and answer academic questions by leveraging vast knowledge databases."
      }
    ];
    
    res.status(200).json({faq:faq})
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})


// all none alcohlic perfume
router.get('/user_content', async (req, res) => {
  try {
    const noneAlcohlic = await user_content.find()
    res.json(noneAlcohlic)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Get user content by user_id
router.post('/user_content', async (req, res) => {
  try {
    const userContent = await user_content.find({ user_id: req.body.user_id });
    if (!userContent) {
      return res.status(404).json({ message: 'User content not found' });
    }
    res.json(userContent);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// Creating one
router.post('/user_content_save', async (req, res) => {
  const user_content_save = new user_content({
    user_id: req.body.user_id,
    description: req.body.description,
    boxname: req.body.boxname,
    create_at: new Date()
  })
  try {
    const user_content = await user_content_save.save()
    res.status(201).json({ message: 'successfuly created', error: false })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})
 
// Deleting One
router.delete(
  '/user_content_deleted',
  removeUserContent,
  async (req, res) => {
    try {
      await res.noneAlcoholic.remove()
      res.json({ message: 'Deleted record' })
    } catch (err) {
      res.status(500).json({ message: err.message })
    }
  },
)
 
  
// // Updating One
router.patch(
  '/user_content_update/:id',
  alcohlicMiddleFunc,
  async (req, res) => {
    if (req.body.name != null) {
      res.alcolicPer.name = req.body.name
    }
    if (req.body.top != null) {
      res.alcolicPer.top = req.body.top
    }
    if (req.body.middle != null) {
      res.alcolicPer.middle = req.body.middle
    }
    
    try {
      const updateRecord = await alcohlicPerfume.findOneAndUpdate(
        { _id: req.params.id },
        req.body,
        { new: true },
      )
      res.json(updateRecord)
    } catch (err) {
      res.status(400).json({ message: err.message })
    }
  },
)

 

// uploading multiple images together
router.post('/images-upload', uploadImg.single('images'), async (req, res) => {
  const fileName = req.file.originalname
  const dirPath =  'https://backend-apis.pasha.org.uk/images/' + fileName

  try {
    return res.status(200).json({
      imgePath: dirPath,
      message: 'images uploaded successfuly.',
      status: true,
    })
  } catch (error) {
    console.log(error)
    res.json(400)
  }
})
 
async function alcohlicMiddleFunc(req, res, next) {
  let alcolicPer
  try {
    alcolicPer = await alcohlicPerfume.findById(req.params.id)
    if (alcolicPer == null) {
      return res.status(404).json({ message: 'Cannot find subscriber' })
    }
  } catch (err) {
    return res.status(500).json({ message: err.message })
  }

  res.alcolicPer = alcolicPer
  next()
}
 
async function removeUserContent(req, res, next) {
  try {
    const noneAlcoholic = await user_content.findByIdAndRemove(req.query.history_id)
    if (noneAlcoholic == null) {
      return res.status(404).json({ message: 'Cannot find record' })
    }
    res.noneAlcoholic = noneAlcoholic
    next()
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}


// track user free credits 
 
// Create track credits
router.post('/track_user_free_credits', async (req, res) => {
  try {
    const u = new trackcredits({
      user_id: req.body.user_id,
      trackcredits: req.body.trackfreecredits,
      created_at: new Date()
    });

    const user_content = await u.save();
    res.status(201).json({ message: 'Successfully created', error: false });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update track credits (add specified number)
router.put('/track_user_free_credits/:user_id/add', async (req, res) => {
  try {
    const user_content = await trackcredits.findOneAndUpdate(
      { user_id: req.params.user_id },
      { $inc: { trackcredits: req.body.addCredits } },
      { new: true }
    );

    if (!user_content) {
      return res.status(404).json({ message: 'Track credits not found' });
    }

    res.status(200).json({ message: 'Successfully updated', error: false });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete track credits (subtract one)
router.put('/track_user_free_credits/:user_id/delete', async (req, res) => {
  try {
    const user_content = await trackcredits.findOneAndUpdate(
      { user_id: req.params.user_id },
      { $inc: { trackcredits: -1 } },
      { new: true }
    );

    if (!user_content) {
      return res.status(404).json({ message: 'Track credits not found' });
    }

    res.status(200).json({ message: 'Successfully deleted', error: false });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}); 


// Get track credits for a user
router.get('/track_user_free_credits/:user_id', async (req, res) => {
  try {
    const user_content = await trackcredits.findOne({ user_id: req.params.user_id });

    if (!user_content) {
      return res.status(404).json({ message: 'Track credits not found' });
    }

    res.status(200).json({ trackcredits: user_content.trackcredits, error: false });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
 
module.exports = router
