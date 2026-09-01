from flask import Flask, jsonify
from client import supabase

app = Flask(__name__)

@app.route("/")
def index():
   return "INDEX"

@app.route("/photos")
def get_photos():
   metadata = (
      supabase.table("photos")  # Name of the schema
      .select("*")              # Columns, * (all)
      .execute().data           # 
   )
   return jsonify(metadata)

if __name__ == "__main__":
   app.run(debug=True)