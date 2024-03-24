from langchain_community.llms import Ollama
from langchain_community.document_loaders import WebBaseLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.embeddings import OllamaEmbeddings
from langchain_community.vectorstores import Chroma
from langchain.chains import RetrievalQA
from langchain.output_parsers import StructuredOutputParser, ResponseSchema
import logging
import re
import json

# Initialize a structured output parser with custom response schemas for parsing model outputs
code_block_parser = StructuredOutputParser.from_response_schemas([
    ResponseSchema(name="code_block", description="Code block found in the output."),
    ResponseSchema(name="text", description="Regular text found in the output."),
])

def parse_output(output):
    code_block_pattern = r"```(.*?)```"
    code_blocks = re.findall(code_block_pattern, output, re.DOTALL)
    formatted_output = re.sub(code_block_pattern, "{code_block}", output)
    parsed_output = code_block_parser.parse(formatted_output)

    final_output = ""
    code_block_index = 0
    for item in parsed_output:
        if "code_block" in item:
            final_output += f'<pre><code>{code_blocks[code_block_index]}</code></pre><button onclick="copyCode(this)">Copy</button>'
            code_block_index += 1
        elif "text" in item:
            final_output += f"<p>{item['text']}</p>"
    return final_output

def is_valid_json(text):
    try:
        json.loads(text)
        return True
    except ValueError:
        return False

class OllamaAPI:
    def __init__(self, base_url, model="mistral", temperature=0.7, top_p=1.0):
        self.base_url = base_url
        self.model = model
        self.temperature = temperature
        self.top_p = top_p
        # Removed max_tokens from Ollama initialization to prevent ValidationError
        self.llm = Ollama(base_url=base_url, model=model, temperature=temperature, top_p=top_p)
        self.embeddings = OllamaEmbeddings(base_url=base_url, model="nomic-embed-text")
        self.vector_store = Chroma(collection_name="ollama_dialogues")
        
    def load_document(self, url):
        try:
            loader = WebBaseLoader(url)
            data = loader.load()
            return data
        except Exception as e:
            logging.error(f"Error loading document: {e}")
            return None

    def split_document(self, document, chunk_size=500, chunk_overlap=20):
        try:
            text_splitter = RecursiveCharacterTextSplitter(chunk_size=chunk_size, chunk_overlap=chunk_overlap)
            splits = text_splitter.split_documents(document)
            return splits
        except Exception as e:
            logging.error(f"Error splitting document: {e}")
            return None

    def embed_and_store_dialogue(self, dialogue):
        splits = self.split_document(dialogue)
        for split in splits:
            embedding = self.embeddings.embed_text(split["text"])
            self.vector_store.store_documents([{"text": split["text"], "embedding": embedding}])

    def query_dialogues(self, query):
        query_embedding = self.embeddings.embed_text(query)
        similar_documents = self.vector_store.similarity_search(query_embedding, top_k=5)
        return [doc["text"] for doc in similar_documents]

    def interact(self, query, document=None):
        try:
            if document:
                self.embed_and_store_dialogue(document)
                vectorstore = self.vector_store
                qa_chain = RetrievalQA.from_chain_type(self.llm, retriever=vectorstore.as_retriever())
                response = qa_chain.run(query)
            else:
                response = self.llm.invoke(query)
            
            if is_valid_json(response):
                formatted_response = parse_output(response)
                return formatted_response
            else:
                logging.info("Received non-JSON response, handling as text.")
                return response
        except Exception as e:
            logging.error(f"Error interacting with Ollama: {e}")
            return f"Error: {str(e)}"

# Example usage and testing code should be added here or in a separate testing environment.