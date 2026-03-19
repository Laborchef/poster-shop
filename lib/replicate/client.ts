import Replicate from 'replicate'

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
})

export async function generateImage(
  prompt: string,
  aspectRatio: string = '3:2',
  webhookUrl: string
) {
  const prediction = await replicate.predictions.create({
    model: 'black-forest-labs/flux-schnell',
    input: {
      prompt,
      aspect_ratio: aspectRatio,
      output_format: 'png',
      num_inference_steps: 4,
    },
    webhook: webhookUrl,
    webhook_events_filter: ['completed'],
  })
  
  return prediction
}

export async function getPrediction(id: string) {
  return await replicate.predictions.get(id)
}