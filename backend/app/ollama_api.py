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
            # Wrap code blocks in HTML <pre><code> for web display with a copy button
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
    def __init__(self, base_url, model="mistral"):
        self.base_url = base_url
        self.model = model
        self.llm = Ollama(base_url=base_url, model=model)
        self.embeddings = OllamaEmbeddings(base_url=base_url, model="nomic-embed-text")

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

    def create_vector_store(self, document):
        try:
            splits = self.split_document(document)
            vectorstore = Chroma.from_documents(documents=splits, embedding=self.embeddings)
            return vectorstore
        except Exception as e:
            logging.error(f"Error creating vector store: {e}")
            return None

    def interact(self, query, document=None):
        try:
            if document:
                vectorstore = self.create_vector_store(document)
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