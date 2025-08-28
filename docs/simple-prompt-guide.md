# Simple Prompt System Implementation

A minimal approach to handle text and copyable prompts in your existing database.

## Data Format (Super Simple)

Just wrap prompts in double brackets in your existing `article` field:

```
This is regular text content.

[[Create 5 email subject lines for my product launch]]

More regular text here.

[[Write a persuasive email body for my product with a strong call-to-action]]

End with more regular text.
```

That's it! Everything in `[[...]]` is a copyable prompt, everything else is regular text.

## Frontend Implementation

### 1. Simple Parser Function

```javascript
// utils/parseContent.js
export function parseContent(text) {
  const parts = text.split(/\[\[(.*?)\]\]/g);
  const blocks = [];
  
  for (let i = 0; i < parts.length; i++) {
    if (i % 2 === 0) {
      // Regular text
      if (parts[i].trim()) {
        blocks.push({
          type: 'text',
          content: parts[i].trim()
        });
      }
    } else {
      // Prompt
      blocks.push({
        type: 'prompt',
        content: parts[i].trim()
      });
    }
  }
  
  return blocks;
}
```

### 2. Copy Button Component

```jsx
// components/CopyButton.jsx
import { useState } from 'react';

export function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button 
      onClick={copy}
      className={`px-3 py-1 rounded text-sm ${
        copied ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
      }`}
    >
      {copied ? '✓ Copied!' : '📋 Copy'}
    </button>
  );
}
```

### 3. Article Display Component

```jsx
// components/Article.jsx
import { parseContent } from '../utils/parseContent';
import { CopyButton } from './CopyButton';

export function Article({ content }) {
  const blocks = parseContent(content);

  return (
    <div className="max-w-4xl mx-auto p-6">
      {blocks.map((block, index) => (
        <div key={index} className="mb-4">
          {block.type === 'text' ? (
            <p className="text-gray-700 leading-relaxed">
              {block.content}
            </p>
          ) : (
            <div className="border border-blue-200 rounded-lg bg-blue-50 p-4">
              <div className="flex justify-between items-start gap-4">
                <p className="text-gray-800 font-medium flex-1">
                  {block.content}
                </p>
                <CopyButton text={block.content} />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
```

## CMS Implementation

### 1. Simple Text Editor

```jsx
// components/admin/SimpleEditor.jsx
import { useState } from 'react';

export function SimpleEditor({ value, onChange }) {
  const [showPreview, setShowPreview] = useState(false);

  const insertPrompt = () => {
    const prompt = window.prompt('Enter your prompt:');
    if (prompt) {
      const newValue = value + `\n\n[[${prompt}]]\n\n`;
      onChange(newValue);
    }
  };

  return (
    <div>
      {/* Toolbar */}
      <div className="mb-4 flex gap-2">
        <button 
          onClick={insertPrompt}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          + Add Prompt
        </button>
        <button 
          onClick={() => setShowPreview(!showPreview)}
          className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          {showPreview ? 'Edit' : 'Preview'}
        </button>
      </div>

      {showPreview ? (
        <div className="border rounded-lg p-4 bg-gray-50 min-h-64">
          <Article content={value} />
        </div>
      ) : (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-64 p-4 border rounded-lg"
          placeholder="Write your content... Use [[prompt text]] for copyable prompts"
        />
      )}
    </div>
  );
}
```

### 2. Form Integration

```jsx
// pages/admin/edit-kit.jsx
import { SimpleEditor } from '../../components/admin/SimpleEditor';

export default function EditKit() {
  const [kitData, setKitData] = useState({
    name: '',
    description: '',
    article: ''
  });

  const handleSave = async () => {
    await fetch('/api/kits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(kitData)
    });
  };

  return (
    <div className="p-6">
      <h1>Edit Kit</h1>
      
      <div className="space-y-4">
        <input
          type="text"
          value={kitData.name}
          onChange={(e) => setKitData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Kit name"
          className="w-full p-2 border rounded"
        />

        <SimpleEditor
          value={kitData.article}
          onChange={(article) => setKitData(prev => ({ ...prev, article }))}
        />

        <button 
          onClick={handleSave}
          className="px-4 py-2 bg-green-500 text-white rounded"
        >
          Save
        </button>
      </div>
    </div>
  );
}
```

## Database Usage

No changes needed! Just save the content with `[[...]]` markers in your existing `article` field:

```javascript
// Save to database
const kitData = {
  name: "Email Marketing Kit",
  article: `Learn email marketing basics.

[[Create 5 compelling email subject lines for [YOUR PRODUCT]]]

Now write the email body.

[[Write a persuasive email for [YOUR PRODUCT] with clear call-to-action]]

Test before sending!`
};

await supabase
  .from('prompt_kits')
  .insert(kitData);
```

## Example Usage

### Input (what you type in CMS):
```
Welcome to our marketing guide.

[[Create a Facebook ad headline for [YOUR PRODUCT] targeting [YOUR AUDIENCE]]]

Social media marketing requires consistency.

[[Write 5 Instagram captions for [YOUR BRAND] in a [TONE] voice]]

Always track your results.
```

### Output (what users see):
- Regular text paragraphs
- Blue highlighted boxes with copy buttons for each prompt
- Users click "Copy" to get the prompt text

## Complete Working Example

```jsx
// pages/kit/[id].jsx
import { Article } from '../../components/Article';

export default function KitPage({ kit }) {
  return (
    <div>
      <h1>{kit.name}</h1>
      <Article content={kit.article} />
    </div>
  );
}

export async function getServerSideProps({ params }) {
  const { data: kit } = await supabase
    .from('prompt_kits')
    .select('*')
    .eq('id', params.id)
    .single();

  return { props: { kit } };
}
```

That's it! Super simple:
- ✅ No database changes
- ✅ Easy to type: just use `[[prompt]]`
- ✅ Easy to parse: simple regex split
- ✅ Copyable prompts in frontend
- ✅ Works with existing data